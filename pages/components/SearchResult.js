// components/SearchResult.js
export default function SearchResult({ results }) {
    return (
      <div>
        {results.map((result, index) => (
          <div key={index} className="card bg-base-100 shadow-md mb-4">
            <div className="card-body">
              <h2 className="card-title">{result.title}</h2>
              <p>{result.snippet}</p>
              <a href={result.link} className="link">Read more</a>
            </div>
          </div>
        ))}
      </div>
    );
  }