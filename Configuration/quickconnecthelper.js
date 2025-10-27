console.log('[QCH] JavaScript file loaded');

(function(window) {
    'use strict';
    
    console.log('[QCH] Initializing Quick Connect Helper');
    
    // Wait for the page to be ready
    var initAttempts = 0;
    var maxAttempts = 50; // Try for 5 seconds
    
    function tryInit() {
        initAttempts++;
        console.log('[QCH] Init attempt', initAttempts);
        
        var page = document.querySelector('.quickConnectHelperConfigPage');
        if (!page && initAttempts < maxAttempts) {
            setTimeout(tryInit, 100);
            return;
        }
        
        if (!page) {
            console.error('[QCH] Page not found after', initAttempts, 'attempts');
            return;
        }
        
        console.log('[QCH] Page found, setting up...');
        
        var userSelect = document.getElementById('userSelect');
        var goButton = document.getElementById('goButton');
        var manualUserId = document.getElementById('manualUserId');
        var manualGoButton = document.getElementById('manualGoButton');
        var statusDiv = document.getElementById('status');
        
        if (!userSelect || !goButton) {
            console.error('[QCH] Required elements not found');
            return;
        }
        
        console.log('[QCH] Elements found');
        
        function showStatus(msg, isError) {
            console.log('[QCH]', isError ? 'ERROR:' : 'INFO:', msg);
            if (statusDiv) {
                statusDiv.textContent = msg;
                statusDiv.style.color = isError ? '#ff5252' : '#4caf50';
                statusDiv.style.display = 'block';
                if (!isError) {
                    setTimeout(function() {
                        statusDiv.style.display = 'none';
                    }, 3000);
                }
            }
        }
        
        function goToQC(userId) {
            if (!userId) {
                showStatus('Please select or enter a user ID', true);
                return;
            }
            console.log('[QCH] Navigating to QC for user:', userId);
            var url = '#!/quickconnect?userId=' + encodeURIComponent(userId);
            console.log('[QCH] URL:', url);
            window.location.href = url;
        }
        
        // Check for ApiClient
        if (typeof ApiClient === 'undefined') {
            console.error('[QCH] ApiClient not available');
            showStatus('API Client not available', true);
            userSelect.innerHTML = '<option>Error: No API</option>';
            
            // Try again after a delay
            setTimeout(function() {
                if (typeof ApiClient !== 'undefined') {
                    console.log('[QCH] ApiClient now available, retrying...');
                    loadUsers();
                }
            }, 2000);
            return;
        }
        
        function loadUsers() {
            console.log('[QCH] Loading users from API');
            
            if (typeof ApiClient === 'undefined') {
                console.error('[QCH] ApiClient still undefined');
                showStatus('API not ready', true);
                return;
            }
            
            console.log('[QCH] Calling ApiClient.getUsers()');
            
            ApiClient.getUsers().then(function(users) {
                console.log('[QCH] Got', users ? users.length : 0, 'users');
                
                if (!users || users.length === 0) {
                    userSelect.innerHTML = '<option>No users found</option>';
                    showStatus('No users found', true);
                    return;
                }
                
                var html = '<option value="">-- Select User --</option>';
                users.forEach(function(u) {
                    html += '<option value="' + u.Id + '">' + u.Name + '</option>';
                    console.log('[QCH] User:', u.Name, '-', u.Id);
                });
                
                userSelect.innerHTML = html;
                goButton.disabled = false;
                showStatus('Loaded ' + users.length + ' users', false);
                
            }).catch(function(err) {
                console.error('[QCH] Error loading users:', err);
                userSelect.innerHTML = '<option>Error loading users</option>';
                showStatus('Error: ' + (err.message || err), true);
            });
        }
        
        // Set up event listeners
        if (goButton) {
            goButton.addEventListener('click', function() {
                console.log('[QCH] Go button clicked');
                goToQC(userSelect.value);
            });
        }
        
        if (manualGoButton) {
            manualGoButton.addEventListener('click', function() {
                var userId = manualUserId.value.trim();
                console.log('[QCH] Manual go clicked, ID:', userId);
                if (!userId) {
                    showStatus('Please enter a user ID', true);
                    return;
                }
                goToQC(userId);
            });
        }
        
        if (userSelect) {
            userSelect.addEventListener('change', function() {
                goButton.disabled = !userSelect.value;
            });
        }
        
        // Load users
        loadUsers();
    }
    
    // Start trying to initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInit);
    } else {
        tryInit();
    }
    
})(window);
