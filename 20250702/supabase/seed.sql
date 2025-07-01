-- 插入测试用户数据
INSERT INTO public.users (email, name, age) VALUES
    ('john.doe@example.com', 'John Doe', 30),
    ('jane.smith@example.com', 'Jane Smith', 25),
    ('bob.johnson@example.com', 'Bob Johnson', 35),
    ('alice.brown@example.com', 'Alice Brown', 28),
    ('charlie.wilson@example.com', 'Charlie Wilson', 32)
ON CONFLICT (email) DO NOTHING; 