import type { Card, Booster, InventoryItem, CardItem, BoosterItem } from '@/api/model/interfaces';

type GroupedCards<T> = {
    base: Omit<T, 'uid'> & Card,
    items: (T & CardItem)[]
};

type GroupedBoosters<T> = {
    base: Omit<T, 'uid'> & Booster,
    items: (T & BoosterItem)[]
};

type GroupedItems<T> = GroupedCards<T> | GroupedBoosters<T>;