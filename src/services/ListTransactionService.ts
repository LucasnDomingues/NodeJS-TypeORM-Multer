import { getCustomRepository } from 'typeorm';
import TransactionRepository, {
  Balance,
} from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

interface ListResponse {
  transactions: Transaction[];
  balance: Balance;
}

class ListTransactionService {
  public async execute(): Promise<ListResponse> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const transactions = await transactionRepository.find();
    const balance = await transactionRepository.getBalance();
    return { transactions, balance };
  }
}
export default ListTransactionService;
