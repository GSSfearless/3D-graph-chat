// components/SearchInput.js
export default function SearchInput({ query, setQuery, handleSearch }) {
    return (
      <form onSubmit={handleSearch}>
        <div className="flex items-center">
          <input
            type="text"
            className="input input-bordered w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query..."
          />
          <button type="submit" className="btn btn-primary ml-2">Search</button>
        </div>
      </form>
    );
  }