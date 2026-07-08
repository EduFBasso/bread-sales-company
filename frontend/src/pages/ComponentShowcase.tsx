import { useState } from 'react';
import { Button, Input, Card } from '../components';
import styles from './styles.module.css';

export function ComponentShowcase() {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneValue, setPhoneValue] = useState('');

  const handleLoadingClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 14);
  };

  return (
    <div className={styles.showcase}>
      <header className={styles.header}>
        <h1>🥖 Componentes Base - Showcase</h1>
        <p>Demonstração dos componentes Button, Input e Card</p>
      </header>

      <div className={styles.container}>
        {/* BUTTONS SECTION */}
        <Card title="📌 Button Component" subtitle="4 variantes + 3 tamanhos">
          <div className={styles.section}>
            <div className={styles.grid}>
              <div>
                <h3>Primary (Padrão)</h3>
                <Button>Clique aqui</Button>
                <Button size="sm">Small</Button>
                <Button size="lg">Large</Button>
              </div>

              <div>
                <h3>Secondary</h3>
                <Button variant="secondary">Botão</Button>
                <Button variant="secondary" size="sm">
                  Small
                </Button>
                <Button variant="secondary" size="lg">
                  Large
                </Button>
              </div>

              <div>
                <h3>Danger</h3>
                <Button variant="danger">Deletar</Button>
                <Button variant="danger" size="sm">
                  Small
                </Button>
                <Button variant="danger" size="lg">
                  Large
                </Button>
              </div>

              <div>
                <h3>Link</h3>
                <Button variant="link">Link Button</Button>
                <Button variant="link" size="sm">
                  Small Link
                </Button>
                <Button variant="link" size="lg">
                  Large Link
                </Button>
              </div>

              <div>
                <h3>Estados</h3>
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
                <Button loading={loading} onClick={handleLoadingClick}>
                  {loading ? 'Carregando...' : 'Clique (2s)'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* INPUTS SECTION */}
        <Card title="📝 Input Component" subtitle="Com label, erro e helpers">
          <div className={styles.section}>
            <Input
              label="Nome Completo"
              placeholder="Digite seu nome"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              helperText="Mínimo 3 caracteres"
            />

            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              error={inputValue.includes('@') ? '' : 'Email inválido'}
            />

            <Input
              label="Telefone"
              placeholder="(11) 98765-4321"
              mask={maskPhone}
              value={phoneValue}
              onChange={(e) => setPhoneValue(e.target.value)}
            />

            <Input label="Campo Desativado" disabled value="Não editável" readOnly />

            <Input
              label="Campo com Erro"
              placeholder="Campo com erro"
              error="Este campo é obrigatório"
            />
          </div>
        </Card>

        {/* CARDS SECTION */}
        <Card title="🎨 Card Component" subtitle="Containers com variações">
          <div className={styles.section}>
            <div className={styles.cardGrid}>
              <Card padding="sm" title="Card Small">
                <p>Padding pequeno</p>
              </Card>

              <Card padding="base" title="Card Base" subtitle="Padding padrão">
                <p>Este é o padding padrão dos cards</p>
              </Card>

              <Card padding="lg" title="Card Large" subtitle="Padding grande">
                <p>Padding maior, melhor para destaque</p>
              </Card>

              <Card hoverable title="Card Hoverable" onClick={() => alert('Card clicável!')}>
                <p>Clique em mim! Sou interativo</p>
              </Card>
            </div>
          </div>
        </Card>

        {/* COMBINED EXAMPLE */}
        <Card title="🔧 Exemplo Combinado" subtitle="Button + Input + Card juntos">
          <div className={styles.section}>
            <Input
              label="Mensagem"
              placeholder="Digite algo..."
              helperText="Sua mensagem será processada"
            />
            <div className={styles.buttonGroup}>
              <Button variant="primary">Enviar</Button>
              <Button variant="secondary">Cancelar</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
