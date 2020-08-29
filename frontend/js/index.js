const headers = {
    headers: { 'Authorization': "Bearer " + localStorage.getItem("api-token") }
};

const getMessages = () => axios.get("http://localhost:3008/api/messages", headers).then((data) => {
    listMessages(data.data); //appel de la fonction d'affichage des messages
}, (err) => {
    //window.location.href = 'login.html'
});

moment.locale('fr')

//declaration de la fonction d'affichage des messages
const listMessages = (messages) => {
    for (let i in messages) {

        let nbLikes = messages[i].likes;

		//Création de la section accueillant la liste des posts
		let listPost = document.createElement("section")
		listPost.setAttribute("class", "post-list");
		//Ajout de la section au conteneur principal HTML
		let main = document.getElementById("main");
		main.appendChild(listPost);

	
    	//On crée les élements de la structure principale
		let postBlock = document.createElement("article");
		postBlock.setAttribute("class", "post-contenant__index");
		listPost.appendChild(postBlock);
		let postContenu = document.createElement("div");
		postContenu.setAttribute("class", "post-contenu");
		postBlock.appendChild(postContenu);
		let postPost = document.createElement("div");
		postPost.setAttribute("class", "post bgc");
		postContenu.appendChild(postPost);

		// post header
		let postPoster = document.createElement("div"); 
		postPoster.settAttribute("class", "poster");
		// user
		let postUserName = document.createElement("span");
		postUserName.settAttribute("class", "user-name");
		postUserName.innerHTML = messages[i].User.firstName + ' ' + messages[i].User.lastName + ' - ' + moment(messages[i].createdAt).format('LLL')+ ' a poster : ';
		postPost.appendChild(postPoster);
		postPoster.appendChild(postUserName);

		// images
        if (messages[i].attachment) {
			let postBlockImage = document.createElement("div");
			postBlockImage.settAttribute("class", "block-image");
			postPost.appendChild(postBlockImage);
			let postLinkSinglPost = document.createElement("a");
			postLinkSinglPost.settAttribute("class", "focus");
			postLinkSinglPost.settAttribute("href", "single-post.html?id=" + messages[i].id);
			postBlockImage.appendChild(postLinkSinglPost);
			let postImage = document.createElement("img");  
			postImage.setAttribute("src", 'http://localhost:3008/images/' + messages[i].attachment);
			postImage.setAttribute("alt", "image du post"); 
			postImage.setAttribute("class", "post-image");  
			postLinkSinglPost.appendChild(postImage);
		}

		// titre
		if (messages[i].title) {
    	let posTitle = document.createElement("h2");
		let postLinkTitle = document.createElement("a");
		postLinkTitle.setAttribute("class", "focus h2");
		postLinkTitle.setAttribute("href", "single-post.html?id=" + messages[i].id);
		postPost.appendChild(posTitle);
		posTitle.appendChild(postLinkTitle);
		postLinkTitle.textContent = messages[i].title;
		}
		
		// message
		if (messages[i].content) {
		let postBody = document.createElement("p");
		postBody.setAttribute("class", "body-post");
		postPost.appendChild(postBody);
		postBody.innerHTML = messages[i].content; 
		}

		// post footer

		let postAction = document.createElement("div");  
		postAction.setAttribute("class", "action");
		postPost.appendChild(postAction);

		// like
        const postLike = document.createElement('i');
        postLike.className = 'far fa-heart';
        postAction.appendChild(postLike);

        // nombres likes
		const postNbLikes = document.createElement('span');
        postNbLikes.id = 'love';
        postLike.appendChild(postNbLikes);
        postNbLikes.innerHTML = nbLikes;

        let like = messages[i].liked

        let likeOrDislike = messages[i].liked ? 'dislike' : 'like'

        btnLikes.addEventListener('click', () => {
            axios.post(`http://localhost:3008/api/messages/${messages[i].id}/action/${likeOrDislike}`, {}, headers).then((resp) => {
                if (likeOrDislike === 'like')
                    nbLikes += 1
                else
                    nbLikes -= 1
                spanLikes.innerHTML = nbLikes + " J'aime";
                likeOrDislike = likeOrDislike === 'like' ? 'dislike' : 'like'
            })
        })
		// effacer
        if (messages[i].modifiable) {

			const postDeleteBtn = document.createElement('i');
        	postDeleteBtn.className = 'fas fa-trash-alt'
        	postAction.appendChild(postDeleteBtn)

            postDeleteBtn.addEventListener('click', () => {
                axios.delete(`http://localhost:3008/api/messages/delete/${messages[i].id}`, headers)
                    .then((resp) => {
                        parent.innerHTML = ''
                        getMessages()
                    })
            })
        }
		
		// modifier
        if (messages[i].modifiable) {
			const PostModifiableLink = document.createElement('a')
            PostModifiableLink.href = `modifypost.html?id=${messages[i].id}`
            postAction.appendChild(PostModifiableLink)
            const postModifyBtn = document.createElement('i')
            PostModifiableLink.appendChild(modifyBtn);
            postModifyBtn.className = 'fas fa-pencil-alt'
        }

	}

};
getMessages()
