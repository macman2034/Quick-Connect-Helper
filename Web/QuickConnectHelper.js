
(function () {
    'use strict';

    // Use a global flag to prevent duplicate execution across multiple script loads
    if (window.quickConnectHelperLoaded) {
        console.log('[QuickConnectHelper] Script already loaded, skipping initialization');
        return;
    }
    window.quickConnectHelperLoaded = true;

    // Flag to prevent concurrent button creation attempts (global scope)
    window.quickConnectHelperButtonCreating = window.quickConnectHelperButtonCreating || false;

    // Wait for Jellyfin to be fully loaded
    function init() {
        checkAdminAndCreateButton();
    }

    function checkAdminAndCreateButton() {
        // Check if user is admin before creating button
        if (typeof ApiClient !== 'undefined' && ApiClient.getCurrentUserId) {
            const userId = ApiClient.getCurrentUserId();
            if (userId) {
                ApiClient.getUser(userId).then(function(user) {
                    console.log('[QuickConnectHelper] Current user:', user.Name, 'IsAdmin:', user.Policy.IsAdministrator);
                    if (user.Policy && user.Policy.IsAdministrator) {
                        createHeaderButton();
                    } else {
                        console.log('[QuickConnectHelper] User is not an administrator, button not created');
                    }
                }).catch(function(error) {
                    console.error('[QuickConnectHelper] Failed to get user info:', error);
                });
            }
        } else {
            // Fallback: try again after a delay
            setTimeout(checkAdminAndCreateButton, 500);
        }
    }

    function createHeaderButton() {
        // Check if button already exists before starting interval
        if (document.getElementById('quickConnectHelperBtn')) {
            console.log('[QuickConnectHelper] Button already exists, skipping creation');
            return;
        }

        // Prevent concurrent creation attempts (use global flag)
        if (window.quickConnectHelperButtonCreating) {
            console.log('[QuickConnectHelper] Button creation already in progress, skipping');
            return;
        }

        window.quickConnectHelperButtonCreating = true;
        console.log('[QuickConnectHelper] Starting button creation process');

        let timeoutId;
        const checkHeader = setInterval(function () {
            // Get all .headerRight elements and check how many there are
            const headerRights = document.querySelectorAll('.headerRight');
            
            if (headerRights.length > 0) {
                clearInterval(checkHeader);
                clearTimeout(timeoutId);  // Clear timeout when successful

                // Double-check button doesn't exist anywhere in the DOM
                if (document.getElementById('quickConnectHelperBtn')) {
                    console.log('[QuickConnectHelper] Button already exists in DOM, skipping');
                    window.quickConnectHelperButtonCreating = false;
                    return;
                }

                console.log('[QuickConnectHelper] Found ' + headerRights.length + ' .headerRight element(s)');

                const button = document.createElement('button');
                button.id = 'quickConnectHelperBtn';
                button.className = 'paper-icon-button-light';
                button.title = 'Quick Connect Helper (Admin Only)';
                button.setAttribute('is', 'paper-icon-button-light');
                button.innerHTML = '<span class="material-icons lock_person"></span>';
                button.style.cssText = 'margin: 0 0.5em;';

                button.addEventListener('click', showQuickConnectModal);

                // Only insert into the FIRST .headerRight (main header, not video player header)
                headerRights[0].insertBefore(button, headerRights[0].firstChild);
                console.log('[QuickConnectHelper] Button created successfully in first .headerRight');
                window.quickConnectHelperButtonCreating = false;
            }
        }, 100);

        timeoutId = setTimeout(function () {
            clearInterval(checkHeader);
            window.quickConnectHelperButtonCreating = false;
            console.log('[QuickConnectHelper] Button creation timeout reached, resetting flag');
        }, 10000);
    }

    function showQuickConnectModal() {
        const isVideoPlayer = window.location.hash.includes('/video');
        
        const modal = document.createElement('div');
        modal.id = 'quickConnectModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${isVideoPlayer ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.25)'};
            display: flex;
            align-items: flex-start;
            justify-content: flex-end;
            z-index: 10000;
            padding: 5em 1.5em 1em 1em;
            box-sizing: border-box;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: rgba(32, 32, 32, 0.88);
            padding: 1.5em;
            border-radius: 6px;
            width: 300px;
            max-width: 85vw;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            border: 2px solid #00a4dc;
        `;

        modalContent.innerHTML = `
            <h2 style="margin-top: 0; margin-bottom: 0.75em; color: #fff; font-size: 1.25em;">Quick Connect Helper</h2>
            <p style="color: #aaa; margin-bottom: 1em; font-size: 0.9em;">Authorize a Quick Connect code for a user:</p>
            <div style="margin-bottom: 1em;">
                <label style="display: block; margin-bottom: 0.4em; color: #fff; font-size: 0.9em;">User:</label>
                <select id="qcUserSelect" style="width: 100%; padding: 0.5em; background: #181818; color: #fff; border: 1px solid #444; border-radius: 4px; font-size: 0.9em;">
                    <option value="">Loading users...</option>
                </select>
            </div>
            <div style="margin-bottom: 1em;">
                <label style="display: block; margin-bottom: 0.4em; color: #fff; font-size: 0.9em;">Quick Connect Code:</label>
                <input type="text" id="qcCodeInput" placeholder="Enter code from device" maxlength="6" autocomplete="off" style="width: 100%; padding: 0.5em; background: #181818; color: #fff; border: 1px solid #444; border-radius: 4px; box-sizing: border-box; text-transform: uppercase; font-size: 0.9em;" />
            </div>
            <div id="qcMessage" style="margin-bottom: 0.75em; padding: 0.5em; border-radius: 4px; display: none; font-size: 0.85em;"></div>
            <div style="display: flex; gap: 0.75em; justify-content: flex-end;">
                <button id="qcCancelBtn" style="padding: 0.5em 1em; background: #444; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">Cancel</button>
                <button id="qcAuthorizeBtn" style="padding: 0.5em 1em; background: #00a4dc; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">Authorize</button>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        document.getElementById('qcCancelBtn').addEventListener('click', closeModal);
        document.getElementById('qcAuthorizeBtn').addEventListener('click', authorizeQuickConnect);
        
        // Auto-uppercase the code input
        document.getElementById('qcCodeInput').addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase();
        });

        loadUsers();
    }

    function closeModal() {
        const modal = document.getElementById('quickConnectModal');
        if (modal) {
            modal.remove();
        }
    }

    function loadUsers() {
        const select = document.getElementById('qcUserSelect');
        if (!select) return;

        if (typeof ApiClient !== 'undefined' && ApiClient.getUsers) {
            ApiClient.getUsers().then(function (users) {
                select.innerHTML = '<option value="">-- Select a user --</option>';
                users.forEach(function (user) {
                    const option = document.createElement('option');
                    option.value = user.Id;
                    option.textContent = user.Name;
                    select.appendChild(option);
                });
            }).catch(function (error) {
                console.error('Failed to load users:', error);
                select.innerHTML = '<option value="">Error loading users</option>';
            });
        } else {
            select.innerHTML = '<option value="">ApiClient not available</option>';
        }
    }

    function authorizeQuickConnect() {
        console.log('[QuickConnectHelper] Authorize button clicked');
        
        const userId = document.getElementById('qcUserSelect').value;
        const code = document.getElementById('qcCodeInput').value.trim();
        const messageDiv = document.getElementById('qcMessage');
        const authorizeBtn = document.getElementById('qcAuthorizeBtn');

        console.log('[QuickConnectHelper] UserId:', userId, 'Code:', code);
        console.log('[QuickConnectHelper] ApiClient available:', typeof ApiClient !== 'undefined');

        messageDiv.style.display = 'none';

        if (!userId) {
            console.log('[QuickConnectHelper] No user selected');
            showMessage('Please select a user', 'error');
            return;
        }

        if (!code || code.length !== 6) {
            console.log('[QuickConnectHelper] Invalid code:', code);
            showMessage('Please enter a 6-digit Quick Connect code', 'error');
            return;
        }

        authorizeBtn.disabled = true;
        authorizeBtn.textContent = 'Authorizing...';

        if (typeof ApiClient !== 'undefined') {
            const url = '/QuickConnect/Authorize?Code=' + encodeURIComponent(code) + '&UserId=' + encodeURIComponent(userId);
            console.log('[QuickConnectHelper] Making request to:', url);
            console.log('[QuickConnectHelper] Current user ID:', ApiClient.getCurrentUserId());
            
            // Use ApiClient's ajax method which handles authentication automatically
            ApiClient.ajax({
                type: 'POST',
                url: ApiClient.getUrl(url),
                dataType: 'json',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function(result) {
                console.log('[QuickConnectHelper] Authorization successful:', result);
                showMessage('Device authorized successfully!', 'success');
                setTimeout(closeModal, 2000);
            }).catch(function(error) {
                console.error('[QuickConnectHelper] Quick Connect authorization failed:', error);
                console.error('[QuickConnectHelper] Error details:', error);
                
                // Try to get more detailed error information
                var errorMsg = 'Authorization failed. Please check the code and try again.';
                if (error && error.responseJSON && error.responseJSON.Message) {
                    errorMsg = 'Authorization failed: ' + error.responseJSON.Message;
                } else if (error && error.statusText) {
                    errorMsg = 'Authorization failed: ' + error.statusText;
                }
                
                showMessage(errorMsg, 'error');
                authorizeBtn.disabled = false;
                authorizeBtn.textContent = 'Authorize';
            });
        } else {
            console.error('[QuickConnectHelper] API Client not available');
            showMessage('API Client not available', 'error');
            authorizeBtn.disabled = false;
            authorizeBtn.textContent = 'Authorize';
        }
    }

    function showMessage(text, type) {
        const messageDiv = document.getElementById('qcMessage');
        if (!messageDiv) return;

        messageDiv.textContent = text;
        messageDiv.style.display = 'block';
        
        if (type === 'success') {
            messageDiv.style.background = '#2e7d32';
            messageDiv.style.color = '#fff';
            messageDiv.style.border = '1px solid #4caf50';
        } else {
            messageDiv.style.background = '#c62828';
            messageDiv.style.color = '#fff';
            messageDiv.style.border = '1px solid #f44336';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-check admin status and recreate button on page navigation if needed
    window.addEventListener('hashchange', function () {
        setTimeout(function() {
            // Only recreate if button doesn't exist (e.g., after full page reload)
            if (!document.getElementById('quickConnectHelperBtn')) {
                checkAdminAndCreateButton();
            }
        }, 500);
    });

})();