let hello = document.getElementById("hello");
let parent = document.getElementById("parent");

console.log(parent);

hello.onclick = (event) => (hello.style.height = "200px");
parent.onclick = (event) => {
  event.target === parent ? console.log(1) : console.log(2);
};
