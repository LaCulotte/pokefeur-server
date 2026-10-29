import type { Card, Booster, InventoryItem, CardItem, BoosterItem } from '@/api/model/interfaces';
import type { Rarity, Type } from '@/common/constants';

type GroupedCards<T> = {
    base: Omit<T & Card, 'uid'>,
    items: (T & CardItem)[]
};

type GroupedBoosters<T> = {
    base: Omit<T & Booster, 'uid'>,
    items: (T & BoosterItem)[]
};

type GroupedItems<T> = GroupedCards<T> | GroupedBoosters<T>;
type GroupedItemsT<I extends BaseItem, T extends InventoryItem> =
    I extends Card
        ? {
              base: Omit<T & I, 'uid'>;
              items: (T & Item<I>)[];
          }
        : I extends Booster
          ? {
                base: Omit<T & I, 'uid'>;
                items: (T & Item<I>)[];
            }
          : never;

type Filters = {
    itemTypes?: 'card' | 'booster',
    itemId?: string,
    name?: string,
    pokemon: Set<number>,
    sets: Set<string>,
    energyType: Set<Type>,
    rarity: Set<Rarity>,
};