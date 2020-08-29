const modifyPost = document.getElementById("modification"); // Récupère le formulaire
const deletePost = document.getElementById('supression');

const apiUrl = "https://localhost:3008/messages/";

//id des différents produits dans l'API

let idPost = "";

const headers = {
    headers: { 'Authorization': "Bearer " + localStorage.getItem("api-token") }
};

//Collecter l'URL après le ?id= pour le récupérer uniquement sur l'API
idPost = location.search.substring(4);

/*Page HTML de la fiche produit sélectionnée
**********************************************/

axios.get (apiUrl+idPost, headers).then(({data: message }) => {
    
    
    //élément de l'API a insérer dans le document HTML
    let postImage = document.getElementById("imagearticle")
    postImage.setAttribute("src", message.attachement);
    let postTitle = document.getElementById("titrearticle")
    postTitle.innerHTML = message.title;
    let postContent = document.getElementById("contenuarticle")
    postContent.innerHTML = message.content;

}, (err) => {
    window.location.href = 'login.html'
});

// pour la modification d'un post
modifyPost.addEventListener('onclick', function (e) {
    e.preventDefault()
    window.open("modifypost.html?id=${messages.id}");

})

// pour la suppression d'un post
deletePost.addEventListener('click', (e) => {
    e.preventDefault()
    axios.delete("http://localhost:3008/api/messages/delete/" + idMessage, headers).then(() => {
        window.location.href = 'index.html'
    })
})

	


	

