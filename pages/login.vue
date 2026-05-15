<script setup>
import { ref } from 'vue';
import { useHead } from '#app';
import { useAuthStore } from '~/stores/auth';
definePageMeta({
  middleware: ["is-auth"]

})

const authStore = useAuthStore();

useHead({
    title: 'Вход в аккаунт // Канбан-доска // Web Engineers',
    meta: [
        { 
            name: 'description', 
            content: 'Страница авторизации для сотрудников компании' 
        },
    ],
});

const mail = ref('');
const password = ref('');
const passwordFieldType = ref('password')

const mailError = ref('');
const showMailError = ref(false);

const passwordError = ref('');
const showPasswordError = ref(false);

const loginState = ref('form');
const globalErrorMessage = ref('');

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const validateMailField = () => {
    if (!mail.value.trim()) {
        mailError.value = 'Пожалуйста, введите вашу почту.';
        showMailError.value = true;
        return false;
    } else if (!emailRegex.test(mail.value)) {
        mailError.value = 'Неверный формат почты.';
        showMailError.value = true;
        return false;
    } else {
        mailError.value = '';
        showMailError.value = false;
        return true;
    }
};

const validatePasswordField = () => {
    if (!password.value.trim()) {
        passwordError.value = 'Пожалуйста, введите ваш пароль.';
        showPasswordError.value = true;
        return false;
    } else {
        passwordError.value = '';
        showPasswordError.value = false;
        return true;
    }
};

const clearMailError = () => {
    if (showMailError.value) {
        showMailError.value = false;
        mailError.value = '';
    }
};

const clearPasswordError = () => {
    if (showPasswordError.value) {
        showPasswordError.value = false;
        passwordError.value = '';
    }
};

const togglePasswordVisibility = () => {
    passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
};

const handleSubmit = async () => {
    globalErrorMessage.value = ''; 
    if (loginState.value !== 'form') loginState.value = 'form'; 

    const isMailValid = validateMailField();
    const isPasswordValid = validatePasswordField();

    if (isMailValid && isPasswordValid) {
        loginState.value = 'loading';
        try {
            const response = await $fetch('/api/auth/login', {
                method: 'POST',
                body: {
                    email: mail.value,
                    password: password.value,
                },
            });
            if (response.success) {
                loginState.value = 'success';
                authStore.login(response.user);
                await navigateTo('/')
            } else {
                loginState.value = 'error';
                globalErrorMessage.value = response.message || 'Неизвестная ошибка авторизации.';
            }
        } catch (error) {
            console.error('API Error:', error);
            loginState.value = 'error';
            globalErrorMessage.value = error.data?.message || 'Не удалось подключиться к серверу. Попробуйте позже.';
        }
    } else {
        console.log('Форма содержит локальные ошибки валидации.');
    }
};

const handleGoBack = () => {
    loginState.value = 'form';
    globalErrorMessage.value = '';
    password.value = '';
};
</script>

<template>
    <section class="auth-section">
        <div class="login-box" :class="{ 'error-state-background': loginState === 'error' }">
            <div class="header-content">
                <h1 style="font-family: 'Breakthrough Bold', sans-serif;">Добро пожаловать</h1>
                <p>Для продолжения необходима авторизация</p>
            </div>
            
            <Transition name="fade-slide" mode="out-in">
                <form v-if="loginState === 'form' || loginState === 'loading'" 
                      :key="'login-form'"
                      @submit.prevent="handleSubmit" 
                      novalidate 
                      class="content-panel login-form-container">
                    
                    <div class="input-group">
                        <label for="mail">Почта</label>
                        <input 
                            placeholder="example@domain.com" 
                            id="mail" 
                            type="email" 
                            v-model="mail" 
                            @blur="validateMailField" 
                            @input="clearMailError" 
                            :disabled="loginState === 'loading'"
                        >
                        <Transition name="error-fade">
                            <div v-if="showMailError" class="error-message">{{ mailError }}</div>
                        </Transition>
                    </div>
                    
                    <div class="input-group password-input-group">
                        <label for="password">Пароль</label>
                        <input 
                            placeholder="Ваш пароль" 
                            id="password" 
                            :type="passwordFieldType" 
                            v-model="password" 
                            @blur="validatePasswordField"
                            @input="clearPasswordError"
                            :disabled="loginState === 'loading'"
                        >
                        <button
                            type="button"
                            @click="togglePasswordVisibility"
                            class="password-toggle-button"
                            aria-label="Переключить видимость пароля"
                            >
                            <svg
                                v-if="passwordFieldType === 'password'"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="lucide lucide-eye"
                            >
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                            <svg
                                v-else
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="feather feather-eye-off"
                                >
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.28 18.28 0 0 1 4.38-5.32M2 2l20 20M15.02 15.02a3.3 3.3 0 0 1-3.02-3.02M12 7.74a3.3 3.3 0 0 1 3.02 3.02"/>
                            </svg>
                            </button>
                        <Transition name="error-fade">
                            <div v-if="showPasswordError" class="error-message">{{ passwordError }}</div>
                        </Transition>
                    </div>
                    
                    <div class="button-group">
                        <button type="submit" :disabled="loginState === 'loading'">
                            <span style="font-family: 'Breakthrough Bold';" v-if="loginState === 'loading'">Вход...</span>
                            <span style="font-family: 'Breakthrough Bold';" v-else>Войти</span>
                        </button>
                    </div>
                </form>

                <div v-else-if="loginState === 'error'" :key="'error-panel'" class="content-panel error-panel-container">
                    <div class="error-icon">⚠️</div>
                    <h2>Ошибка авторизации</h2>
                    <p>{{ globalErrorMessage }}</p>
                    <button @click="handleGoBack" class="return-btn">Вернуться к форме</button>
                </div>

                <div v-else-if="loginState === 'success'" :key="'success-panel'" class="content-panel success-panel-container">
                    <div class="success-icon">✅</div>
                    <h2>Авторизация успешна!</h2>
                    <p>Добро пожаловать в систему!</p>
                </div>
            </Transition>
        </div>
    </section>
</template>

<style scoped>
.auth-section {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.login-box {
    background: #ffffff11;
    padding: 30px 40px;
    backdrop-filter: blur(5px);
    border-radius: 15px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    width: 100%;
    max-width: 400px;
    transition: background 0.5s ease-in-out, border 0.5s ease-in-out;
    min-height: 380px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.login-box.error-state-background {
    background: linear-gradient(135deg, #a0303022, #b51f1f22);
}

.header-content {
    text-align: center;
    margin-bottom: 30px;
    width: 100%;
}

.header-content h1 {
    font-family: 'Breakthrough Bold', sans-serif;
    color: #ffffff;
    font-size: 2.2em;
    margin-bottom: 10px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header-content p {
    color: #d0d0d0;
    font-size: 0.95em;
}

.content-panel {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
}

.input-group {
    position: relative;
    margin-bottom: 25px;
}

label {
    display: block;
    margin-bottom: 8px;
    color: #e0e0e0;
    font-size: 0.9em;
    font-weight: 600;
    letter-spacing: 0.5px;
}

input {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ffffff44;
    border-radius: 8px;
    background-color: #ffffff22;
    color: #ffffff;
    font-size: 1em;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
}

input::placeholder {
    color: #ffffff88;
    opacity: 1;
}

input:focus {
    border-color: #00bfff;
    background-color: #ffffff33;
    box-shadow: 0 0 0 3px rgba(0, 191, 255, 0.3);
}

input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #ffffff10;
}

.password-input-group {
    position: relative; 
}

.password-toggle-button {
  position: absolute;
  top: 65%;
  right: 10px;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
}

.password-toggle-button:hover {
  color: #333;
}

.password-toggle-button svg {
  width: 20px;
  height: 20px;
  vertical-align: middle;
}

.error-message {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: calc(100% + 15px);
    
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.85em;
    white-space: nowrap;
    z-index: 10;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    max-width: 200px;
    text-align: left;
    
    &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: -8px;
        transform: translateY(-50%) rotate(45deg);
        width: 14px;
        height: 14px;
        background: inherit;
        border-radius: 2px;
        z-index: -1;
    }
}

.error-fade-enter-active, .error-fade-leave-active {
    transition: all 0.3s ease;
}
.error-fade-enter-from, .error-fade-leave-to {
    opacity: 0;
    transform: translateY(-50%) translateX(-10px);
}

.button-group {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}

.button-group button {
    font-size: 18px;
    padding: 10px 20px;
}

.error-panel-container, .success-panel-container {
    text-align: center;
    padding: 20px;
    border-radius: 10px;
    color: white;
}

.error-panel-container h2, .success-panel-container h2 {
    font-size: 1.8em;
    margin-bottom: 15px;
    font-family: 'Breakthrough Bold', sans-serif;
}

.error-panel-container p, .success-panel-container p {
    font-size: 1em;
    margin-bottom: 25px;
    line-height: 1.4;
}

.error-icon, .success-icon {
    font-size: 3em;
    margin-bottom: 20px;
}

.return-btn {
    padding: 10px 20px;
    font-size: 1em;
    margin-top: 20px;
    background: linear-gradient(135deg, #ffffff, #e0e0e0);
    color: #333;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.return-btn:hover {
    background: linear-gradient(135deg, #e0e0e0, #c0c0c0);
    transform: translateY(-1px);
}
.return-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.5s ease;
    position: absolute; 
    top: 90px;
    left: 40px;
    width: calc(100% - 80px);
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(20px);
}
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

@media (max-width: 768px) {
    .error-message {
        position: static;
        margin-top: 10px;
        transform: none;
        left: auto;
        width: 100%;
        white-space: normal;
        text-align: center;
        
        &::before {
            display: none;
        }
    }
    .input-group {
        margin-bottom: 20px; 
    }
    .login-box {
        padding: 20px 25px; 
    }
    .password-toggle-btn {
        right: 10px;
    }

    .fade-slide-enter-active,
    .fade-slide-leave-active {
        width: calc(100% - 50px);
        left: 25px;
        top: 80px;
    }
}
</style>