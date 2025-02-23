import React, { useState } from 'react';
import { Layout, Menu, Button, Typography } from 'antd';
import { ApiOutlined, FileTextOutlined } from '@ant-design/icons';
import AISearch from '../components/AISearch';
import DocumentAnalysis from '../components/DocumentAnalysis';
import styles from '../styles/Home.module.css';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function Home() {
  const [mode, setMode] = useState<'ai' | 'document' | null>(null);
  
  // 如果用户还没选择模式，显示选择界面
  if (!mode) {
    return (
      <div className={styles.modeSelection}>
        <Title level={2}>选择知识图谱生成方式</Title>
        <div className={styles.modeButtons}>
          <Button
            type="primary"
            size="large"
            icon={<ApiOutlined />}
            onClick={() => setMode('ai')}
            className={styles.modeButton}
          >
            AI 对话生成
            <div className={styles.modeDescription}>
              通过与AI对话，实时生成知识图谱
            </div>
          </Button>
          
          <Button
            type="primary"
            size="large"
            icon={<FileTextOutlined />}
            onClick={() => setMode('document')}
            className={styles.modeButton}
          >
            文档解析生成
            <div className={styles.modeDescription}>
              上传文档，自动分析生成知识图谱
            </div>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Layout className={styles.container}>
      <Header className={styles.header}>
        <div className={styles.logo}>Think Graph</div>
        <Menu 
          mode="horizontal" 
          selectedKeys={[mode]}
          onSelect={({key}) => setMode(key as 'ai' | 'document')}
        >
          <Menu.Item key="ai" icon={<ApiOutlined />}>
            AI 对话
          </Menu.Item>
          <Menu.Item key="document" icon={<FileTextOutlined />}>
            文档解析
          </Menu.Item>
        </Menu>
      </Header>

      <Layout>
        <Content className={styles.content}>
          {mode === 'ai' ? (
            <AISearch />
          ) : (
            <DocumentAnalysis />
          )}
        </Content>
      </Layout>
    </Layout>
  );
} 