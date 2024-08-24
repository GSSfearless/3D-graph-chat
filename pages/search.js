import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from '../styles/Search.module.css'

const Search = () => {
  const router = useRouter()
  const { query } = router.query
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    if (query) {
      // 调用搜索 API 或处理搜索逻辑，示例中用静态数据替代
      setSearchResults([
        {
          ref: 'AI生成的答案',
          meme: 'Cooking Meme',
          results: [
            'Answer 1',
            'Answer 2',
            'Answer 3',
          ]
        },
        // 更多搜索结果...
      ])
    }
  }, [query])

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2>AI 生成的回答</h2>
        <div className={styles.answer}>
          <p>Answer content here...</p>
        </div>
        <h2>Cooking Meme</h2>
        <div className={styles.meme}>
          <p>Meme content here...</p>
        </div>
      </div>

      <div className={styles.main}>
        <h2>搜索结果</h2>
        {searchResults.map((result, index) => (
          <div key={index} className={styles.resultItem}>
            <h3>{result.ref}</h3>
            <p>{result.results.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Search