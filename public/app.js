// Assuming you have the posts array from posts.json (make sure it's in JSON format)
const posts = [
    {
        "Image URL": "https://raw.githubusercontent.com/WELCOMETOTHETRIBE/taplink-assets/main/coconut.jpg",
        "Caption": "Sipping on island vibes, one coconut at a time 🥥✨",
        "Hashtags": "#TropicalDreams #CoconutCraze #IslandLife #NatureInABottle #SunshineSips",
        "Status": "Draft"
    }
    // Add more posts as needed
];

const postContainer = document.getElementById('postContainer');

posts.forEach(post => {
    const postDiv = document.createElement('div');
    postDiv.classList.add('post');
    
    // Add the image to the post
    const image = document.createElement('img');
    image.src = post["Image URL"];
    image.alt = "Post Image";
    postDiv.appendChild(image);
    
    // Create the "Open in Canva" button
    const canvaBtn = document.createElement('button');
    canvaBtn.innerText = "Open in Canva";
    canvaBtn.onclick = () => window.open(`https://www.canva.com/design?image=${post["Image URL"]}`, '_blank');
    
    // Append the button to the post div
    postDiv.appendChild(canvaBtn);
    
    // Add the post div to the container
    postContainer.appendChild(postDiv);
});
