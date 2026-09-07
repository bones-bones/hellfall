import { SetCode } from '@hellfall/shared/types';
import { numDateRecord } from './numDateRecord';

/**
 * Maps accepted orders to the correct dates.
 */
class SetDateMap {
  defaultDate: string;
  numberMap = new Map<number, string>();
  constructor(record: Record<number, string>) {
    const keys = Object.keys(record);
    const min = Number(keys.at(0));
    const max = Number(keys.at(-1));

    let currentDate = record[min];
    for (let i = min; i <= max; i++) {
      if (i in record) {
        currentDate = record[i];
      }
      this.numberMap.set(i, currentDate);
    }
    this.defaultDate = currentDate;
  }

  get = (accepted_order: string) =>
    this.numberMap.get(parseInt(accepted_order)) ?? this.defaultDate;
}

/**
 * Maps sets and accepted orders to the correct dates.
 */
class CardDateMap {
  dateMap = new Map<SetCode, SetDateMap>();
  constructor(full_record: Partial<Record<SetCode, Record<number, string>>>) {
    (Object.entries(full_record) as [SetCode, Record<number, string>][]).forEach(([code, record]) =>
      this.dateMap.set(code, new SetDateMap(record))
    );
  }
  /**
   * Gets the corresponding date for a card
   * @param code code of the card's set
   * @param accepted_order the accepted order of the card
   */
  get = (code: SetCode, accepted_order: string) => this.dateMap.get(code)?.get(accepted_order);
}

/**
 * Maps sets and accepted orders to the correct dates.
 */
export const cardDateMap = new CardDateMap(numDateRecord);
