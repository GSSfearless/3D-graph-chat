// components/MemeCard.js
export default function MemeCard({ memeData }) {
    return (
      <div className="card bg-base-100 shadow-md mt-4">
        <div className="card-body">
          <h2 className="card-title">Generated Meme</h2>
          <p>{memeData.text}</p>
          <img src={memeData.image} alt="Generated Meme" />
        </div>
      </div>
    );
  }