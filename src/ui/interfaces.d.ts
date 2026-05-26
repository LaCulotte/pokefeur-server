import type { Card, Booster, InventoryItem, CardItem, BoosterItem } from '@/api/model/interfaces';
import type { Rarity, Type } from '@/common/constants';

type GroupedCards<T> = {
    base: Omit<T, 'uid'> & Card,
    items: (T & CardItem)[]
};

type GroupedBoosters<T> = {
    base: Omit<T, 'uid'> & Booster,
    items: (T & BoosterItem)[]
};

type GroupedItems<T> = GroupedCards<T> | GroupedBoosters<T>;

type Filters = {
    itemTypes?: 'card' | 'booster',
    itemId?: string,
    name?: string,
    pokemon: Set<number>,
    sets: Set<string>,
    energyType: Set<Type>,
    rarity: Set<Rarity>,
};