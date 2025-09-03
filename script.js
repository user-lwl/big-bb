class MaKaBaEncoder {
    constructor() {
        // 玛卡巴编码映射表
        this.encodeMap = ['玛', '卡', '巴'];
        this.separator = '咔';
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        const encryptBtn = document.getElementById('encryptBtn');
        const decryptBtn = document.getElementById('decryptBtn');
        const clearBtn = document.getElementById('clearBtn');
        const copyBtn = document.getElementById('copyBtn');
        const inputText = document.getElementById('inputText');
        const outputText = document.getElementById('outputText');
        const useKeyCheckbox = document.getElementById('useKey');
        const keyInputContainer = document.getElementById('keyInputContainer');
        const keyInput = document.getElementById('keyInput');
        const toggleKeyBtn = document.getElementById('toggleKeyVisibility');
        
        encryptBtn.addEventListener('click', () => this.encrypt());
        decryptBtn.addEventListener('click', () => this.decrypt());
        clearBtn.addEventListener('click', () => this.clearAll());
        copyBtn.addEventListener('click', () => this.copyResult());
        
        // 密钥相关事件
        useKeyCheckbox.addEventListener('change', () => this.toggleKeyInput());
        toggleKeyBtn.addEventListener('click', () => this.toggleKeyVisibility());
        
        // 回车键快捷操作
        inputText.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.encrypt();
            } else if (e.altKey && e.key === 'Enter') {
                this.decrypt();
            }
        });
    }
    
    // 切换密钥输入框显示
    toggleKeyInput() {
        const useKeyCheckbox = document.getElementById('useKey');
        const keyInputContainer = document.getElementById('keyInputContainer');
        const keyInput = document.getElementById('keyInput');
        
        if (useKeyCheckbox.checked) {
            keyInputContainer.style.display = 'block';
            keyInput.focus();
        } else {
            keyInputContainer.style.display = 'none';
            keyInput.value = '';
        }
    }
    
    // 切换密钥可见性
    toggleKeyVisibility() {
        const keyInput = document.getElementById('keyInput');
        const toggleKeyBtn = document.getElementById('toggleKeyVisibility');
        
        if (keyInput.type === 'password') {
            keyInput.type = 'text';
            toggleKeyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"></path><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"></path><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"></path><path d="m2 2 20 20"></path></svg>`;
            toggleKeyBtn.title = '隐藏密钥';
        } else {
            keyInput.type = 'password';
            toggleKeyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
            toggleKeyBtn.title = '显示密钥';
        }
    }
    
    // 简单的密钥混合函数（XOR加密）
    mixWithKey(text, key) {
        if (!key) return text;
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const textChar = text.charCodeAt(i);
            const keyChar = key.charCodeAt(i % key.length);
            result += String.fromCharCode(textChar ^ keyChar);
        }
        return result;
    }
    
    // 将字符转换为二进制，然后用玛卡巴表示
    encodeChar(char) {
        const charCode = char.charCodeAt(0);
        const binary = charCode.toString(2);
        
        let result = '';
        for (let bit of binary) {
            if (bit === '0') {
                result += this.encodeMap[0]; // 玛
            } else {
                result += this.encodeMap[1]; // 卡
            }
        }
        
        // 添加结束标记
        result += this.encodeMap[2]; // 巴作为字符结束标记
        
        return result;
    }
    
    // 将玛卡巴密文解码为字符
    decodeChar(encoded) {
        if (!encoded.endsWith(this.encodeMap[2])) {
            throw new Error('无效的编码格式');
        }
        
        // 移除结束标记
        const binaryStr = encoded.slice(0, -1);
        let binary = '';
        
        for (let char of binaryStr) {
            if (char === this.encodeMap[0]) { // 玛
                binary += '0';
            } else if (char === this.encodeMap[1]) { // 卡
                binary += '1';
            } else {
                throw new Error('无效的编码字符');
            }
        }
        
        const charCode = parseInt(binary, 2);
        return String.fromCharCode(charCode);
    }
    
    // 加密整个文本
    encryptText(text, key = '') {
        if (!text.trim()) {
            this.showMessage('请输入要加密的内容', 'warning');
            return '';
        }
        
        try {
            // 如果使用密钥，先进行密钥混合
            let processedText = text;
            if (key) {
                processedText = this.mixWithKey(text, key);
            }
            
            const encodedChars = [];
            for (let char of processedText) {
                encodedChars.push(this.encodeChar(char));
            }
            return encodedChars.join(this.separator);
        } catch (error) {
            this.showMessage('加密失败：' + error.message, 'error');
            return '';
        }
    }
    
    // 解密整个文本
    decryptText(encodedText, key = '') {
        if (!encodedText.trim()) {
            this.showMessage('请输入要解密的密文', 'warning');
            return '';
        }
        
        try {
            const encodedChars = encodedText.split(this.separator);
            let result = '';
            
            for (let encoded of encodedChars) {
                if (encoded.trim()) {
                    result += this.decodeChar(encoded);
                }
            }
            
            // 如果使用密钥，需要进行反向密钥混合
            if (key) {
                result = this.mixWithKey(result, key);
            }
            
            return result;
        } catch (error) {
            this.showMessage('解密失败：请检查密文格式和密钥是否正确', 'error');
            return '';
        }
    }
    
    // 获取密钥
    getKey() {
        const useKeyCheckbox = document.getElementById('useKey');
        const keyInput = document.getElementById('keyInput');
        
        if (useKeyCheckbox.checked) {
            const key = keyInput.value.trim();
            if (!key) {
                this.showMessage('请输入密钥', 'warning');
                keyInput.focus();
                return null;
            }
            return key;
        }
        return '';
    }
    
    // 加密操作
    encrypt() {
        const inputText = document.getElementById('inputText').value;
        const outputText = document.getElementById('outputText');
        
        const key = this.getKey();
        if (key === null) return; // 需要密钥但未输入
        
        const encrypted = this.encryptText(inputText, key);
        if (encrypted) {
            outputText.value = encrypted;
            const message = key ? '加密成功！（已使用密钥）' : '加密成功！';
            this.showMessage(message, 'success');
            this.animateElement(outputText, 'success-animation');
        }
    }
    
    // 解密操作
    decrypt() {
        const inputText = document.getElementById('inputText').value;
        const outputText = document.getElementById('outputText');
        
        const key = this.getKey();
        if (key === null) return; // 需要密钥但未输入
        
        const decrypted = this.decryptText(inputText, key);
        if (decrypted) {
            outputText.value = decrypted;
            const message = key ? '解密成功！（已使用密钥）' : '解密成功！';
            this.showMessage(message, 'success');
            this.animateElement(outputText, 'success-animation');
        }
    }
    
    // 清空所有内容
    clearAll() {
        document.getElementById('inputText').value = '';
        document.getElementById('outputText').value = '';
        this.showMessage('已清空输入和输出内容', 'info');
    }
    
    // 复制结果
    async copyResult() {
        const outputText = document.getElementById('outputText');
        const copyBtn = document.getElementById('copyBtn');
        
        if (!outputText.value.trim()) {
            this.showMessage('没有内容可复制', 'warning');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(outputText.value);
            this.showMessage('复制成功！', 'success');
            
            // 按钮动画效果
            copyBtn.classList.add('copy-success');
            setTimeout(() => {
                copyBtn.classList.remove('copy-success');
            }, 300);
            
        } catch (error) {
            // 降级方案
            outputText.select();
            document.execCommand('copy');
            this.showMessage('复制成功！', 'success');
        }
    }
    
    // 显示消息提示
    showMessage(message, type = 'info') {
        // 移除已存在的消息
        const existingMessage = document.querySelector('.message-toast');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `message-toast message-${type}`;
        toast.textContent = message;
        
        // 添加样式
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '1000',
            animation: 'slideInRight 0.3s ease-out',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        // 根据类型设置背景色
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        toast.style.background = colors[type] || colors.info;
        
        document.body.appendChild(toast);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => toast.remove(), 300);
            }
        }, 3000);
    }
    
    // 元素动画效果
    animateElement(element, animationClass) {
        element.classList.add(animationClass);
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, 600);
    }
}

// 添加消息动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new MaKaBaEncoder();
    
    // 添加快捷键提示
    const inputText = document.getElementById('inputText');
    inputText.title = '快捷键：Ctrl+Enter 加密，Alt+Enter 解密';
    
    console.log('🔊 大声bb 已启动！');
    console.log('玛卡巴密文系统已就绪 ✨');
    console.log('新增功能：密钥加密 🔐');
});