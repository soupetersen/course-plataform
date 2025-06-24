# Quiz Builder Components

Este diretório contém um sistema modular para criação e edição de quizzes, dividido em componentes menores e reutilizáveis.

## Estrutura de Componentes

### 1. `QuizBuilder` (Principal)
Componente principal que orquestra todos os outros componentes.

### 2. `QuizBasicInfo`
Gerencia as informações básicas do quiz:
- Título
- Descrição
- Nota mínima para aprovação

### 3. `QuizSettings`
Configurações avançadas do quiz:
- Tempo limite
- Mostrar explicações
- Permitir tentativas múltiplas
- Embaralhar perguntas

### 4. `QuestionsList`
Lista e gerencia todas as perguntas do quiz:
- Adicionar/remover perguntas
- Renderiza cada pergunta usando `QuestionCard`

### 5. `QuestionCard`
Componente individual para cada pergunta:
- Texto da pergunta
- Explicação opcional
- Gerencia opções de resposta usando `QuestionOptions`

### 6. `QuestionOptions`
Gerencia as opções de resposta de uma pergunta:
- Adicionar/remover opções
- Marcar resposta correta
- Validação de pelo menos uma resposta correta

## Tipos Compartilhados

Todos os tipos estão definidos em `types.ts`:
- `QuizFormData`: Dados do formulário completo
- `QuizQuestion`: Estrutura de uma pergunta
- `QuestionOption`: Estrutura de uma opção de resposta

## Como Usar

```tsx
import { QuizBuilder } from './QuizBuilderRefactored';
import type { QuizFormData } from './quiz/types';

const MyComponent = () => {
  const handleSave = (data: QuizFormData) => {
    // Processar dados do quiz
    console.log(data);
  };

  return (
    <QuizBuilder
      initialData={{
        title: "Meu Quiz",
        passThreshold: 70,
        questions: []
      }}
      onSave={handleSave}
      onCancel={() => console.log("Cancelado")}
    />
  );
};
```

## Vantagens da Refatoração

1. **Componentes Menores**: Cada componente tem uma responsabilidade específica
2. **Reutilização**: Componentes podem ser reutilizados em outros contextos
3. **Manutenibilidade**: Mais fácil de manter e debugar
4. **Testabilidade**: Cada componente pode ser testado isoladamente
5. **Tipos Compartilhados**: Consistência de tipos em toda a aplicação

## Integração com Diálogos

O `QuizDialog` mostra como integrar o `QuizBuilder` em um modal:

```tsx
<QuizDialog
  isOpen={isQuizDialogOpen}
  onClose={() => setIsQuizDialogOpen(false)}
  initialData={existingQuizData}
/>
```

## Próximos Passos

1. Integrar com a API de backend
2. Adicionar validações mais robustas
3. Implementar drag-and-drop para reordenar perguntas
4. Adicionar suporte a diferentes tipos de pergunta (múltipla escolha, verdadeiro/falso, etc.)
5. Implementar preview do quiz
