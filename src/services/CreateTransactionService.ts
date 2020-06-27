import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

interface TransactionRequest {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: TransactionRequest): Promise<Transaction> {
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid transaction type');
    }

    const transactionRepository = getCustomRepository(TransactionRepository);

    const transactionExists = await transactionRepository.findOne({
      where: { title },
    });

    if (transactionExists) {
      throw new AppError('Transaction already exists');
    }

    if (type === 'outcome') {
      const {
        total: availableMoney,
      } = await transactionRepository.getBalance();
      if (availableMoney - value < 0) {
        throw new AppError('Insuficient money');
      }
    }

    const categoriesRepository = getRepository(Category);

    const existentCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    let transactionCategoryObject: Category;
    if (!existentCategory) {
      transactionCategoryObject = categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(transactionCategoryObject);
    } else {
      transactionCategoryObject = existentCategory;
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category: transactionCategoryObject,
    });

    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
