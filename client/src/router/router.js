import {createRouter, createWebHistory} from 'vue-router';
import Main from '../components/Main.vue';
import SignUp from '../components/auth/SignUp.vue';
import SignIn from '../components/auth/SignIn.vue';
import Room from '../components/room/Room.vue';
import RoomCreator from "../components/room/RoomCreator.vue";
import RoomConnector from "../components/room/RoomConnector.vue"
import {useAuthStore} from "../stores/auth.js";
import {storeToRefs} from "pinia";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {path: '/', component: Main},
        {path: '/:id', component: Room},
        {path: '/rooms', component: RoomCreator},
        {path: '/connect', component: RoomConnector},
        {path: '/signup', component: SignUp},
        {path: '/signin', component: SignIn},
    ],
});

router.beforeEach(async (to) => {
    const authPages = new Set(['/signup', '/signin']);
    const isAuthRequired = !authPages.has(to.path);

    const authStore = useAuthStore();
    const {isAuthorized} = storeToRefs(authStore);

    if (isAuthRequired && !isAuthorized.value) {
        return '/signin';
    }

    if (!isAuthRequired && isAuthorized.value) {
        return '/';
    }
});

export default router;
