


hello.onclick = (event) => (hello.style.height = "200px");
parent.onclick = (event) => {
  event.target === parent ? console.log(1) : console.log(2);
};
