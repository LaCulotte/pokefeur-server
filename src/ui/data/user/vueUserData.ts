import { reactive, ref, type Reactive, type Ref, computed } from "vue";
import { UserData } from "./userData";

export const user: Reactive<UserData> = reactive(new UserData());
user.launchLoad();

// TODO : use store like Pinia
// export const userComputedData = {
//     pendingTradeProposals: computed(() => {
//         return Object.values(user.data.trades.proposals).filter((proposal) => {
//             // return proposal.from.accepted == "pending"
//         })
//     }),
// }