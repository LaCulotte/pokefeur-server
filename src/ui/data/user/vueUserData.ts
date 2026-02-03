import { reactive, ref, type Reactive, type Ref } from "vue";
import { UserData } from "./userData";

export const user: Reactive<UserData> = reactive(new UserData());
user.launchLoad();
