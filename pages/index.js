import { useRouter } from 'next/router'
import { useState } from 'react'
import styles from '../styles/Home.module.css'; // 将样式保存在 styles/Home.module.css 文件中

const Home = () => {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    router.push(`/search?query=${encodeURIComponent(query)}`)
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>AI 搜索引擎</h1>
        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
            placeholder="请输入搜索内容"
          />
          <button type="submit" className={styles.searchButton}>搜索</button>
        </form>
      </main>
    </div>
  )
}

export default Home