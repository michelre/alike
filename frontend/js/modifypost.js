const modification = document.querySelector('#postbtnmodification');

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
        const title = document.querySelector('#title')
        const post = document.querySelector('#post')
        title.value = message.title
        post.value = message.content
    }, (err) => {
        window.location.href = 'login.html'
    });

// pour la modification d'un post
modification.addEventListener('submit', function (e) {
    e.preventDefault()
    const title = e.target.title.value;
    const content = e.target.post.value;

    const data = {
        title,
        content
    }

    axios.put("http://localhost:3008/api/messages/" + idMessage, data, headers).then(() => {
        window.location.href = 'index.html'
    })

});