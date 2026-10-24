<template>
  <footer id="Dasaran">
    <div class="kolom">
      <p>Made by</p>
      <div class="social">
        <img src="../assets/LOGO ABDN white.png" alt="ABDN" width="70px" />
      </div>
      <p style="color: #818181; font-size: smaller">©2026</p>
    </div>
  </footer>
</template>

<style lang="css" scoped>
@import url("https://fonts.googleapis.com/css?family=IBM%20Plex%20Sans:500|IBM%20Plex%20Sans:300");

* {
  box-sizing: border-box;
  scroll-behavior: smooth;
}

h2 {
  font-weight: 500;
  text-align: center;
  font-size: var(--m);
  margin: 0;
}

h3 {
  font-weight: 500;
  font-size: calc(0.6 * var(--m));
  margin: 0;
}

.card {
  height: calc(8 * var(--m));
  width: calc(12 * var(--m));
  background: linear-gradient(120deg, #ff8064, #725bdc);
  color: black;
  border-radius: calc(0.5 * var(--m));

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--m);

  position: fixed;
  margin: calc(2 * var(--m)) calc(5 * var(--m)) calc(5 * var(--m))
    calc(5 * var(--m));
}

button {
  background-color: #000;
  font-size: calc(0.4 * var(--m));
  border: none;
  color: #e5e5e5;
  font-family: "IBM Plex Sans";
  font-weight: 400;
  padding: calc(0.35 * var(--m)) calc(0.8 * var(--m));
  border-radius: calc(0.3 * var(--m));
}

#Dasaran {
  margin-top: 1px;
  z-index: 5;
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: flex-end;
  padding: 6rem 2vw;
  position: relative;
}

#Dasaran::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    rgba(0, 0, 0, 0) 5%,
    rgba(0, 0, 0, 0.3) 20%,
    rgba(0, 0, 0, 0.6) 30%,
    rgba(0, 0, 0, 0.8) 40%,
    rgba(0, 0, 0, 1) 50%,
    rgb(0, 0, 0)
  );
  z-index: -7;
}

.backdrop {
  z-index: -5;
  position: absolute;
  inset: 0;

  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);

  mask-image: linear-gradient(
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.5) 10%,
    rgba(0, 0, 0, 0.8) 20%,
    rgba(0, 0, 0, 1) 30%,
    rgb(0, 0, 0)
  );

  -webkit-mask-image: linear-gradient(
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.5) 10%,
    rgba(0, 0, 0, 0.8) 20%,
    rgba(0, 0, 0, 1) 30%,
    rgb(0, 0, 0)
  );
}

.kolom {
  text-align: center;
  width: 100%;
}

.col3 {
  background-color: #121212;
  border-radius: calc(0.5 * var(--m));
}

img {
  height: calc(0.3 * var(--m));
  object-fit: cover;
}

.social {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1rem;
}

a {
  text-decoration: none;
  color: inherit;
}

.link {
  width: calc(0.8 * var(--m));
  height: calc(0.8 * var(--m));
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: calc(0.1 * var(--m));

  display: flex;
  justify-content: center;
  align-items: center;
}

@media screen and (max-width: 1000px) {
  :root {
    --m: 3rem;
  }
}

@media screen and (max-width: 700px) {
  footer {
    flex-direction: column;
    padding: 5rem 20vw;
  }
  .col {
    width: 100%;
  }
}
</style>
