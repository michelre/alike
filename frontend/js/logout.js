const logout = document.getElementById('logout')

logout.addEventListener('click', () => {
    localStorage.removeItem('api-token')
    window.location.href = 'login.html'
})