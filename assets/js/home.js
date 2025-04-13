document.addEventListener('DOMContentLoaded', async () => {
    const websiteList = document.getElementById('websiteList');
    const editModal = document.getElementById('editModal');
    
    // 加载网站列表
    async function loadWebsites() {
        try {
            const response = await fetch('/api/websites');
            const websites = await response.json();
            websiteList.innerHTML = websites.map(website => `
                <div class="website-card">
                    <h3>${website.name}</h3>
                    <p>${website.description || '暂无描述'}</p>
                    <div class="card-actions">
                        <button class="run-test" data-urls='${JSON.stringify(website.urls)}'>执行测试</button>
                        <button class="edit" data-id="${website.id}">编辑</button>
                        <button class="delete" data-id="${website.id}">删除</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('加载失败:', error);
        }
    }

    // 添加网站按钮点击事件
    document.getElementById('addWebsite').addEventListener('click', () => {
        document.getElementById('websiteForm').reset();
        editModal.style.display = 'block';
    });

    // 表单提交事件
    document.getElementById('websiteForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            description: document.getElementById('description').value,
            urls: document.getElementById('urls').value.split('\n').filter(url => url.trim())
        };
        
        const websiteId = document.getElementById('websiteId').value;
        const method = websiteId ? 'PUT' : 'POST';
        const url = websiteId ? `/api/websites/${websiteId}` : '/api/websites';

        try {
            console.log('提交URL:', url, '方法:', method, '数据:', formData);
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            editModal.style.display = 'none';
            await loadWebsites();
        } catch (error) {
            console.error('保存失败:', error);
        }
    });

    // 删除和编辑事件委托
    websiteList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete')) {
            console.log('删除按钮点击，ID:', e.target.dataset.id);
            if (confirm('确定要删除这个网站吗？')) {
                try {
                    const response = await fetch(`/api/websites/${e.target.dataset.id}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    await loadWebsites();
                } catch (error) {
                    console.error('删除失败:', error);
                }
            }
        }
        
        if (e.target.classList.contains('edit')) {
            console.log('编辑按钮点击，ID:', e.target.dataset.id);
            console.log('请求URL:', `/api/websites/${e.target.dataset.id}`);
            try {
                const response = await fetch(`/api/websites/${e.target.dataset.id}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const website = await response.json();
                console.log('获取到的网站数据:', website);
                console.log('当前表单ID值:', document.getElementById('websiteId').value);
                document.getElementById('websiteId').value = website.id;
                document.getElementById('name').value = website.name;
                document.getElementById('description').value = website.description;
                document.getElementById('urls').value = (website.urls || []).join('\n');
                editModal.style.display = 'block';
            } catch (error) {
                console.error('加载网站信息失败:', error);
            }
        }
        
        if (e.target.classList.contains('run-test')) {
            const websiteId = e.target.closest('.website-card').querySelector('.edit').dataset.id;
            const urls = JSON.parse(e.target.dataset.urls);
            try {
                const response = await fetch(`/api/websites/run-test/${websiteId}`, { method: 'POST' });
                const data = await response.json();
                alert(data.message);
                urls.forEach(url => runSingleTest(url));
            } catch (error) {
                console.error('测试启动失败:', error);
            }
        }
    });

    // 关闭弹窗
    document.querySelector('.cancel').addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    // 初始化加载
    await loadWebsites();
});