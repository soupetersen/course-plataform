import { QuestionRepository } from '@/interfaces/QuestionRepository';
import { Question, QuestionOption } from '@/models/Question';
import { PrismaClient } from '@prisma/client';

export class PrismaQuestionRepository implements QuestionRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Partial<Question>): Promise<Question> {
    const question = await this.prisma.question.create({
      data: {
        id: data.id!,
        lessonId: data.lessonId!,
        question: data.question!,
        explanation: data.explanation || null,
        order: data.order ?? 0,
        points: data.points ?? 1,
      }
    });

    return new Question(
      question.id,
      question.lessonId,
      question.question,
      question.explanation,
      question.order,
      question.points,
      question.createdAt,
      question.updatedAt
    );
  }

  async findById(id: string): Promise<Question | null> {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: { options: { orderBy: { order: 'asc' } } }
    });

    if (!question) return null;

    return new Question(
      question.id,
      question.lessonId,
      question.question,
      question.explanation,
      question.order,
      question.points,
      question.createdAt,
      question.updatedAt
    );
  }

  async findByLessonId(lessonId: string): Promise<Question[]> {
    const questions = await this.prisma.question.findMany({
      where: { lessonId },
      include: { options: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' }
    });

    return questions.map(question => new Question(
      question.id,
      question.lessonId,
      question.question,
      question.explanation,
      question.order,
      question.points,
      question.createdAt,
      question.updatedAt
    ));
  }

  async update(id: string, data: Partial<Question>): Promise<Question> {
    const question = await this.prisma.question.update({
      where: { id },
      data: {
        question: data.question,
        explanation: data.explanation,
        order: data.order,
        points: data.points,
        updatedAt: new Date()
      }
    });

    return new Question(
      question.id,
      question.lessonId,
      question.question,
      question.explanation,
      question.order,
      question.points,
      question.createdAt,
      question.updatedAt
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.question.delete({ where: { id } });
  }

  async createOption(data: Partial<QuestionOption>): Promise<QuestionOption> {
    const option = await this.prisma.questionOption.create({
      data: {
        id: data.id!,
        questionId: data.questionId!,
        text: data.text!,
        isCorrect: data.isCorrect ?? false,
        order: data.order ?? 0,
      }
    });

    return new QuestionOption(
      option.id,
      option.questionId,
      option.text,
      option.isCorrect,
      option.order,
      option.createdAt
    );
  }

  async findOptionsByQuestionId(questionId: string): Promise<QuestionOption[]> {
    const options = await this.prisma.questionOption.findMany({
      where: { questionId },
      orderBy: { order: 'asc' }
    });

    return options.map(option => new QuestionOption(
      option.id,
      option.questionId,
      option.text,
      option.isCorrect,
      option.order,
      option.createdAt
    ));
  }

  async updateOption(id: string, data: Partial<QuestionOption>): Promise<QuestionOption> {
    const option = await this.prisma.questionOption.update({
      where: { id },
      data: {
        text: data.text,
        isCorrect: data.isCorrect,
        order: data.order,
      }
    });

    return new QuestionOption(
      option.id,
      option.questionId,
      option.text,
      option.isCorrect,
      option.order,
      option.createdAt
    );
  }

  async deleteOption(id: string): Promise<void> {
    await this.prisma.questionOption.delete({ where: { id } });
  }

  async deleteOptionsByQuestionId(questionId: string): Promise<void> {
    await this.prisma.questionOption.deleteMany({ where: { questionId } });
  }
}
