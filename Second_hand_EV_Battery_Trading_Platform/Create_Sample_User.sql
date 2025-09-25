-- Script để tạo User mẫu cho testing
-- Chạy script này trước khi test API

-- Tạo Role mẫu nếu chưa có
IF NOT EXISTS (SELECT 1 FROM [dbo].[Role] WHERE [RoleName] = 'User')
BEGIN
    INSERT INTO [dbo].[Role] ([RoleId], [RoleName], [Description], [CreatedAt], [UpdatedAt])
    VALUES (NEWID(), 'User', 'Regular user role', GETUTCDATE(), GETUTCDATE());
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[Role] WHERE [RoleName] = 'Admin')
BEGIN
    INSERT INTO [dbo].[Role] ([RoleId], [RoleName], [Description], [CreatedAt], [UpdatedAt])
    VALUES (NEWID(), 'Admin', 'Administrator role', GETUTCDATE(), GETUTCDATE());
END

-- Lấy RoleId của User role
DECLARE @UserRoleId UNIQUEIDENTIFIER = (SELECT TOP 1 [RoleId] FROM [dbo].[Role] WHERE [RoleName] = 'User');

-- Tạo User mẫu
IF NOT EXISTS (SELECT 1 FROM [dbo].[User] WHERE [Email] = 'test@example.com')
BEGIN
    INSERT INTO [dbo].[User] ([UserId], [RoleId], [FullName], [Email], [Phone], [PasswordHash], [Status], [CreatedAt], [UpdatedAt])
    VALUES (
        NEWID(), 
        @UserRoleId, 
        'Test User', 
        'test@example.com', 
        '0123456789', 
        'hashed_password_here', 
        'Active', 
        GETUTCDATE(), 
        GETUTCDATE()
    );
END

-- Hiển thị thông tin User vừa tạo
SELECT 
    u.[UserId],
    u.[FullName],
    u.[Email],
    u.[Phone],
    u.[Status],
    r.[RoleName]
FROM [dbo].[User] u
INNER JOIN [dbo].[Role] r ON u.[RoleId] = r.[RoleId]
WHERE u.[Email] = 'test@example.com';
