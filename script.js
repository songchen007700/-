let map;
let userLocation;
let isLoggedIn = false;
let users = []; // 用于存储用户信息

const avatars = [
    'images/avatar1.jpg',
    'images/avatar2.jpg',
    'images/avatar3.jpg',
    'images/avatar4.jpg',
    'images/avatar5.jpg'
];

const parkingData = [
    { name: "停车场A", location: new BMap.Point(118.10256, 24.581), available: 50 },
    { name: "停车场B", location: new BMap.Point(118.10300, 24.582), available: 30 },
    { name: "停车场C", location: new BMap.Point(118.10400, 24.580), available: 20 },
    // 可以继续添加更多停车场数据...
];

// 初始化百度地图
function initMap() {
    map = new BMap.Map("map");
    const point = new BMap.Point(118.102556, 24.588431);
    map.centerAndZoom(point, 15);
    setInterval(refreshMapData, 30000);

    map.addControl(new BMap.NavigationControl());
    map.addControl(new BMap.ScaleControl());

    // 添加停车场标记
    updateParkingMarkers();

}

// 添加停车场标记
function updateParkingMarkers() {
    map.clearOverlays(); // 清空原有标记
    parkingData.forEach(parking => {
        const marker = new BMap.Marker(parking.location);
        map.addOverlay(marker);

        const label = new BMap.Label(`${parking.name}: ${parking.available} 个空位`, {
            position: parking.location,
            offset: new BMap.Size(20, -10),
        });

        // 添加导航按钮
        label.setContent(`${parking.name}: ${parking.available} 个空位 <button onclick="openNavigation('${parking.name}', ${parking.location.lng}, ${parking.location.lat})">导航</button>`);
        map.addOverlay(label);
    });
    highlightNearestParking();
}

// 登录按钮点击事件
document.getElementById('loginBtn').onclick = function() {
    document.getElementById('modal').style.display = 'block';
};

// 关闭模态框
document.querySelector('.close').onclick = function() {
    document.getElementById('modal').style.display = 'none';
};

// 登录处理逻辑
document.getElementById('authForm').onsubmit = function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        alert('登录成功');
        document.getElementById('modal').style.display = 'none';
        document.getElementById('user-info').style.display = 'block';
        document.getElementById('username-display').innerText = username;
        document.getElementById('loginBtn').style.display = 'none';
        isLoggedIn = true;

        const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
        document.getElementById('user-avatar').src = randomAvatar;

        enableSearchAndRefresh();
        getLocation();
    } else {
        alert('用户名或密码错误');
    }
};

// 注册按钮点击事件
document.getElementById('registerBtn').onclick = function() {
    document.getElementById('registerModal').style.display = 'block';
    document.getElementById('modal').style.display = 'none';
};

// 关闭注册模态框
document.querySelector('.close-register').onclick = function() {
    document.getElementById('registerModal').style.display = 'none';
};

// 注册处理逻辑
document.getElementById('registerForm').onsubmit = function(event) {
    event.preventDefault();
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;

    if (users.some(u => u.username === newUsername)) {
        alert('用户名已存在，请选择其他用户名');
    } else {
        users.push({ username: newUsername, password: newPassword });
        alert('注册成功，请登录');
        document.getElementById('registerModal').style.display = 'none';
        document.getElementById('modal').style.display = 'block'; // 自动打开登录框
    }
};

// 找回密码按钮点击事件
document.getElementById('forgotPasswordBtn').onclick = function() {
    document.getElementById('forgotPasswordModal').style.display = 'block';
    document.getElementById('modal').style.display = 'none';
};

// 关闭找回密码模态框
document.querySelector('.close-forgot-password').onclick = function() {
    document.getElementById('forgotPasswordModal').style.display = 'none';
};

// 找回密码处理逻辑
document.getElementById('forgotPasswordForm').onsubmit = function(event) {
    event.preventDefault();
    const forgotUsername = document.getElementById('forgotUsername').value;

    const user = users.find(u => u.username === forgotUsername);
    if (user) {
        alert('您的密码是: ' + user.password);
    } else {
        alert('用户名不存在');
    }
};

// 获取用户地理位置
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            userLocation = new BMap.Point(position.coords.longitude, position.coords.latitude);
            map.centerAndZoom(userLocation, 15);
            const marker = new BMap.Marker(userLocation);
            map.addOverlay(marker);
            highlightNearestParking(); // 在获取到用户位置后高亮最近停车场
        });
    }
}

// 刷新地图数据
function refreshMapData() {
    parkingData.forEach(parking => {
        parking.available = Math.floor(Math.random() * 100); // 随机生成可用车位
    });
    updateParkingMarkers();
}

// 启用搜索和手动刷新
function enableSearchAndRefresh() {
    document.getElementById('searchInput').disabled = false;
    document.getElementById('searchBtn').disabled = false;
    document.getElementById('refreshBtn').disabled = false;
}

// 搜索停车场
document.getElementById('searchBtn').onclick = function() {
    const searchValue = document.getElementById('searchInput').value;
    const foundParking = parkingData.find(p => p.name.includes(searchValue));
    if (foundParking) {
        map.centerAndZoom(foundParking.location, 15);
        alert(`找到停车场: ${foundParking.name}, 可用车位: ${foundParking.available}`);
    } else {
        alert('未找到相关停车场');
    }
};

// 手动刷新
document.getElementById('refreshBtn').onclick = function() {
    refreshMapData();
};

// 突出显示最近停车场
function highlightNearestParking() {
    if (!userLocation) return;

    let nearestParking = null;
    let minDistance = Infinity;

    parkingData.forEach(parking => {
        const distance = map.getDistance(userLocation, parking.location);
        if (distance < minDistance) {
            minDistance = distance;
            nearestParking = parking;
        }
    });

    if (nearestParking) {
        // 添加显著标记
        const nearestMarker = new BMap.Marker(nearestParking.location, {
            icon: new BMap.Icon("images/nearest.png", new BMap.Size(32, 32))
        });
        map.addOverlay(nearestMarker);
        
        // 添加标签
        const label = new BMap.Label(`${nearestParking.name} (最近): ${nearestParking.available} 个空位`, {
            position: nearestParking.location,
            offset: new BMap.Size(20, -40), // 调整偏移量，增加高度
        });
        label.setStyle({ color: 'red', fontSize: '16px', fontWeight: 'bold', zIndex: 1000 }); // 设置标签样式和z-index
        map.addOverlay(label);
    }
}


// 打开导航功能
function openNavigation(parkingName, lng, lat) {
    const navigationURL = `https://api.map.baidu.com/direction?origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}&mode=driving&region=YourRegion&output=html`;
    window.open(navigationURL, '_blank');
}

// 页面加载时初始化地图
window.onload = initMap;
