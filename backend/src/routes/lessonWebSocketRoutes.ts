import { FastifyInstance } from 'fastify';
import { JwtService } from '@/services/JwtService';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: number;
}

interface UserConnection {
  userId: string;
  userName?: string;
  userRole?: string;
  socket: any;
  currentLessonId?: string;
  currentCourseId?: string;
  joinedAt: Date;
  lastActivity: Date;
}

interface LessonRoom {
  lessonId: string;
  courseId: string;
  connections: Map<string, UserConnection>;
  createdAt: Date;
  lastActivity: Date;
}

// Map para armazenar conexões ativas por usuário
const activeConnections = new Map<string, UserConnection>();

// Map para armazenar salas de aulas (rooms por lição)
const lessonRooms = new Map<string, LessonRoom>();

export async function lessonWebSocketRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();
  const jwtService = new JwtService();

  // Cleanup de conexões inativas a cada 5 minutos
  setInterval(() => {
    cleanupInactiveConnections();
  }, 5 * 60 * 1000);

  // WebSocket para aulas em tempo real
  fastify.get('/ws/lessons', { websocket: true }, async (socket, request) => {
    // Autenticação via query string (token)
    const query = request.query as { token?: string };
    const token = query.token;
    
    if (!token) {
      socket.close(1008, 'Token de autenticação requerido');
      return;
    }

    let userId: string;
    let userInfo: any;
    
    try {
      const decoded = jwtService.verifyToken(token);
      userId = decoded.userId;
      
      // Buscar informações completas do usuário
      userInfo = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true
        }
      });

      if (!userInfo || !userInfo.isActive) {
        socket.close(1008, 'Usuário inválido ou inativo');
        return;
      }
      
    } catch (error) {
      socket.close(1008, 'Token inválido');
      return;
    }

    // Registrar conexão
    const connectionId = `${userId}-${Date.now()}`;
    const connection: UserConnection = {
      userId,
      userName: userInfo.name,
      userRole: userInfo.role,
      socket,
      joinedAt: new Date(),
      lastActivity: new Date()
    };
    
    activeConnections.set(connectionId, connection);

    fastify.log.info(`🔌 User ${userInfo.name} (${userId}) connected to lesson WebSocket`);

    // Enviar confirmação de conexão
    socket.send(JSON.stringify({
      type: 'connected',
      data: { 
        userId, 
        userName: userInfo.name,
        userRole: userInfo.role,
        connectionId,
        timestamp: Date.now()
      }
    }));

    // Manipular mensagens
    socket.on('message', async (rawMessage: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(rawMessage.toString());
        message.timestamp = Date.now();
        
        // Atualizar última atividade
        connection.lastActivity = new Date();
        
        await handleWebSocketMessage(connectionId, message, prisma, fastify);
      } catch (error) {
        fastify.log.error('Error processing WebSocket message:', error);
        socket.send(JSON.stringify({
          type: 'error',
          data: { message: 'Erro ao processar mensagem' },
          timestamp: Date.now()
        }));
      }
    });

    // Cleanup ao desconectar
    socket.on('close', () => {
      handleDisconnection(connectionId, fastify);
    });

    // Tratamento de erro
    socket.on('error', (error: any) => {
      fastify.log.error('WebSocket error:', error);
      handleDisconnection(connectionId, fastify);
    });
  });

  async function handleWebSocketMessage(
    connectionId: string,
    message: WebSocketMessage,
    prisma: PrismaClient,
    fastify: FastifyInstance
  ) {
    const connection = activeConnections.get(connectionId);
    if (!connection) return;

    const { userId, socket } = connection;

    switch (message.type) {
      case 'join_lesson':
        await handleJoinLesson(connection, message.data, prisma);
        break;

      case 'video_progress':
        await handleVideoProgress(connection, message.data, prisma);
        break;

      case 'complete_lesson':
        await handleCompleteLesson(connection, message.data, prisma);
        break;

      case 'quiz_submit':
        await handleQuizSubmit(connection, message.data, prisma);
        break;

      case 'ping':
        socket.send(JSON.stringify({ type: 'pong', data: { timestamp: Date.now() } }));
        break;

      default:
        socket.send(JSON.stringify({
          type: 'error',
          data: { message: `Tipo de mensagem desconhecido: ${message.type}` }
        }));
    }
  }

  async function handleJoinLesson(
    connection: UserConnection,
    data: { lessonId: string; courseId: string },
    prisma: PrismaClient
  ) {
    const { userId, socket } = connection;
    const { lessonId, courseId } = data;

    // Verificar se o usuário está matriculado no curso
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId, isActive: true }
    });

    if (!enrollment) {
      socket.send(JSON.stringify({
        type: 'error',
        data: { message: 'Você não está matriculado neste curso' }
      }));
      return;
    }

    // Atualizar informações da conexão
    connection.currentLessonId = lessonId;
    connection.currentCourseId = courseId;

    // Buscar progresso atual
    const progress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId }
      }
    });

    socket.send(JSON.stringify({
      type: 'lesson_joined',
      data: {
        lessonId,
        courseId,
        progress: progress || null
      }
    }));
  }

  async function handleVideoProgress(
    connection: UserConnection,
    data: { watchTime: number },
    prisma: PrismaClient
  ) {
    const { userId, socket, currentLessonId, currentCourseId } = connection;
    
    if (!currentLessonId || !currentCourseId) {
      socket.send(JSON.stringify({
        type: 'error',
        data: { message: 'Você precisa entrar em uma lição primeiro' }
      }));
      return;
    }

    try {
      // Atualizar ou criar progresso
      const progress = await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: { userId, lessonId: currentLessonId }
        },
        update: {
          watchTime: data.watchTime,
          lastAccessed: new Date(),
          updatedAt: new Date(),
        },
        create: {
          id: randomUUID(),
          userId,
          lessonId: currentLessonId,
          courseId: currentCourseId,
          watchTime: data.watchTime,
          isCompleted: false,
          lastAccessed: new Date(),
        }
      });

      socket.send(JSON.stringify({
        type: 'progress_updated',
        data: { watchTime: progress.watchTime }
      }));
    } catch (error) {
      console.error('Error updating video progress:', error);
      socket.send(JSON.stringify({
        type: 'error',
        data: { message: 'Erro ao salvar progresso' }
      }));
    }
  }

  async function handleCompleteLesson(
    connection: UserConnection,
    data: any,
    prisma: PrismaClient
  ) {
    const { userId, socket, currentLessonId, currentCourseId } = connection;
    
    if (!currentLessonId || !currentCourseId) {
      socket.send(JSON.stringify({
        type: 'error',
        data: { message: 'Você precisa entrar em uma lição primeiro' }
      }));
      return;
    }

    try {
      const progress = await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: { userId, lessonId: currentLessonId }
        },
        update: {
          isCompleted: true,
          completedAt: new Date(),
          lastAccessed: new Date(),
          updatedAt: new Date(),
        },
        create: {
          id: randomUUID(),
          userId,
          lessonId: currentLessonId,
          courseId: currentCourseId,
          isCompleted: true,
          completedAt: new Date(),
          watchTime: 0,
          lastAccessed: new Date(),
        }
      });

      socket.send(JSON.stringify({
        type: 'lesson_completed',
        data: { lessonId: currentLessonId, completedAt: progress.completedAt }
      }));
    } catch (error) {
      console.error('Error completing lesson:', error);
      socket.send(JSON.stringify({
        type: 'error',
        data: { message: 'Erro ao marcar lição como concluída' }
      }));
    }
  }

  async function handleQuizSubmit(
    connection: UserConnection,
    data: { answers: Array<{ questionId: string; selectedOptionId?: string; timeSpent: number }> },
    prisma: PrismaClient
  ) {
    const { userId, socket, currentLessonId, currentCourseId } = connection;
    
    if (!currentLessonId || !currentCourseId) {
      socket.send(JSON.stringify({
        type: 'error',
        data: { message: 'Você precisa entrar em uma lição primeiro' }
      }));
      return;
    }

    try {
      // Buscar perguntas da lição
      const questions = await prisma.question.findMany({
        where: { lessonId: currentLessonId },
        include: { options: true }
      });

      if (questions.length === 0) {
        socket.send(JSON.stringify({
          type: 'error',
          data: { message: 'Nenhuma pergunta encontrada para esta lição' }
        }));
        return;
      }

      // Calcular pontuação
      let correctAnswers = 0;
      let totalPoints = 0;
      let earnedPoints = 0;

      for (const answer of data.answers) {
        const question = questions.find(q => q.id === answer.questionId);
        if (!question) continue;

        totalPoints += question.points;
        const selectedOption = question.options.find(opt => opt.id === answer.selectedOptionId);
        const isCorrect = selectedOption?.isCorrect || false;

        if (isCorrect) {
          correctAnswers++;
          earnedPoints += question.points;
        }
      }

      const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      const isPassing = score >= 70; // TODO: Buscar da lição

      // Criar tentativa de quiz
      const quizAttempt = await prisma.quizAttempt.create({
        data: {
          id: randomUUID(),
          userId,
          lessonId: currentLessonId,
          courseId: currentCourseId,
          score,
          totalQuestions: questions.length,
          correctAnswers,
          isPassing,
          timeSpent: data.answers.reduce((total, ans) => total + ans.timeSpent, 0),
        }
      });

      // Criar respostas
      for (const answer of data.answers) {
        const question = questions.find(q => q.id === answer.questionId);
        if (!question) continue;

        const selectedOption = question.options.find(opt => opt.id === answer.selectedOptionId);
        const isCorrect = selectedOption?.isCorrect || false;

        await prisma.quizAnswer.create({
          data: {
            id: randomUUID(),
            attemptId: quizAttempt.id,
            questionId: answer.questionId,
            selectedOptionId: answer.selectedOptionId,
            isCorrect,
            timeSpent: answer.timeSpent,
          }
        });
      }

      // Se passou, marcar lição como concluída
      if (isPassing) {
        await handleCompleteLesson(connection, {}, prisma);
      }

      socket.send(JSON.stringify({
        type: 'quiz_result',
        data: {
          score,
          correctAnswers,
          totalQuestions: questions.length,
          isPassing,
          message: isPassing ? 'Parabéns! Você passou no quiz!' : 'Você precisa de uma pontuação maior para passar.'
        }
      }));
    } catch (error) {
      console.error('Error submitting quiz:', error);
      socket.send(JSON.stringify({
        type: 'error',
        data: { message: 'Erro ao processar quiz' }
      }));
    }
  }

  // Função para lidar com desconexão
  function handleDisconnection(connectionId: string, fastify: FastifyInstance) {
    const connection = activeConnections.get(connectionId);
    if (connection) {
      // Remover da sala da lição se estiver em uma
      if (connection.currentLessonId) {
        const room = lessonRooms.get(connection.currentLessonId);
        if (room) {
          room.connections.delete(connectionId);
          if (room.connections.size === 0) {
            lessonRooms.delete(connection.currentLessonId);
          }
        }
      }
      
      activeConnections.delete(connectionId);
      fastify.log.info(`🔌 User ${connection.userName} (${connection.userId}) disconnected from lesson WebSocket`);
    }
  }

  // Função para limpeza de conexões inativas
  function cleanupInactiveConnections() {
    const now = new Date();
    const timeout = 30 * 60 * 1000; // 30 minutos

    for (const [connectionId, connection] of activeConnections.entries()) {
      if (now.getTime() - connection.lastActivity.getTime() > timeout) {
        connection.socket.close(1000, 'Connection timeout');
        activeConnections.delete(connectionId);
        
        // Remover da sala se estiver em uma
        if (connection.currentLessonId) {
          const room = lessonRooms.get(connection.currentLessonId);
          if (room) {
            room.connections.delete(connectionId);
            if (room.connections.size === 0) {
              lessonRooms.delete(connection.currentLessonId);
            }
          }
        }
      }
    }

    // Limpar salas vazias
    for (const [lessonId, room] of lessonRooms.entries()) {
      if (room.connections.size === 0) {
        lessonRooms.delete(lessonId);
      }
    }
  }

  // Função para broadcast para todos os usuários em uma lição
  function broadcastToLesson(lessonId: string, message: any, excludeConnectionId?: string) {
    const room = lessonRooms.get(lessonId);
    if (!room) return;

    for (const [connectionId, connection] of room.connections.entries()) {
      if (excludeConnectionId && connectionId === excludeConnectionId) continue;
      
      try {
        connection.socket.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error broadcasting message:', error);
        // Remover conexão com erro
        room.connections.delete(connectionId);
        activeConnections.delete(connectionId);
      }
    }
  }
}
