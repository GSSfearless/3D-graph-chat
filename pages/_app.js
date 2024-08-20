// pages/_app.js
import './styles/global.css'; // 确保引用路径无误
import './styles/globals.css'; // 确保引用路径无误

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;