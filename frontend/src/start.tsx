import "./styles/start.scss";

export const Home = () => {
  return (
    <>
      <section className="start-page">
        <p className="start-title">Chattie</p>
      </section>
      <section className="start-image">
        <img className="mobile-img" src="src/icons8-smartphone-48.png" alt="" />
        <img
          src="https://i.pinimg.com/originals/e3/1b/75/e31b752875679b64fce009922f9f0dda.gif"
          alt=""
          className="gif-img"
        />
      </section>

      <div className="start-image">
        <img className="mobile-img" src="src/icons8-smartphone-48.png" alt="" />
        <img
          src="https://i.pinimg.com/originals/e3/1b/75/e31b752875679b64fce009922f9f0dda.gif"
          alt=""
          className="gif-img"
        />
      </div>
      <div className="button">
        <button className="start-button">
          <p>Start Messaging</p>
        </button>
      </div>
    </>
  );
};
