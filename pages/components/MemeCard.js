import Image from 'next/image';

export default function MemeCard({ memeData }) {
  return (
    <div className="card bg-base-100 shadow-md mt-4">
      <div className="card-body">
        <h2 className="card-title">Generated Meme</h2>
        <p>{memeData.text}</p>
        {/* 使用 next/image 优化图片 */}
        <Image src={memeData.image} alt="Generated Meme" layout="responsive" width={700} height={475} />
      </div>
    </div>
  );
}