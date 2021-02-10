const like = (element) => {
  axios
    .get(`/product/${element.getAttribute("data-productid")}/like`)
    .then((response) => {
      // Change icon to liked/disliked
      // Change like number
      element.classList.toggle("unliked");
      const likeNumber = element.querySelector("span");
      likeNumber.innerText = Number(likeNumber.innerText) + response.data.add;
    })
    .catch((e) => console.error("Error liking product", e));
};

//  /product/{{_id}}/like
