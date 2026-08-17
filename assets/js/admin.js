const loginArea = document.getElementById("loginArea");
const adminArea = document.getElementById("adminArea");
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const publishButton = document.getElementById("publishButton");
const loginMessage = document.getElementById("loginMessage");
const publishMessage = document.getElementById("publishMessage");

async function checkSession() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error(error);
        showLogin();
        return;
    }

    if (data.session) {
        showAdmin();
    } else {
        showLogin();
    }
}

function showAdmin() {
    loginArea.style.display = "none";
    adminArea.style.display = "block";
}

function showLogin() {
    loginArea.style.display = "block";
    adminArea.style.display = "none";
}

loginButton.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    loginMessage.textContent = "Iniciando sesión...";

    const { error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        loginMessage.textContent = "Error: " + error.message;
        console.error(error);
        return;
    }

    loginMessage.textContent = "";
    showAdmin();
});

logoutButton.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    showLogin();
});

publishButton.addEventListener("click", async () => {
    publishMessage.textContent = "Publicando...";

    const name = document.getElementById("name").value.trim();
    const category = document.getElementById("category").value;
    const version = document.getElementById("version").value.trim();
    const description = document.getElementById("description").value.trim();

    const imageFile = document.getElementById("imageFile").files[0];
    const contentFile = document.getElementById("contentFile").files[0];

    if (!name || !version || !contentFile) {
        publishMessage.textContent = "Completa el nombre, versión y archivo.";
        return;
    }

    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        publishMessage.textContent = "Debes iniciar sesión.";
        return;
    }

    const userId = userData.user.id;

    const safeName = contentFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const contentPath = "uploads/" + Date.now() + "-" + safeName;

    const { error: uploadError } = await supabaseClient.storage
        .from("content")
        .upload(contentPath, contentFile);

    if (uploadError) {
        publishMessage.textContent =
            "Error al subir el archivo: " + uploadError.message;
        return;
    }

    let imageUrl = null;

    if (imageFile) {
        const safeImageName =
            imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");

        const imagePath = "uploads/" + Date.now() + "-" + safeImageName;

        const { error: imageError } = await supabaseClient.storage
            .from("content")
            .upload(imagePath, imageFile);

        if (imageError) {
            publishMessage.textContent =
                "Error al subir la imagen: " + imageError.message;
            return;
        }

        const { data: imageData } = supabaseClient.storage
            .from("content")
            .getPublicUrl(imagePath);

        imageUrl = imageData.publicUrl;
    }

    const { data: fileData } = supabaseClient.storage
        .from("content")
        .getPublicUrl(contentPath);

    const { error: databaseError } = await supabaseClient
        .from("posts")
        .insert({
            name: name,
            category: category,
            version: version,
            description: description,
            image_url: imageUrl,
            file_url: fileData.publicUrl,
            published: true,
            user_id: userId
        });

    if (databaseError) {
        publishMessage.textContent =
            "Error al guardar la publicación: " + databaseError.message;
        console.error(databaseError);
        return;
    }

    publishMessage.textContent =
        "¡Contenido publicado correctamente! 🎉";

    document.getElementById("name").value = "";
    document.getElementById("version").value = "";
    document.getElementById("description").value = "";
    document.getElementById("imageFile").value = "";
    document.getElementById("contentFile").value = "";
});

checkSession();