def get_average(numbers):
    total = 0
    for n in numbers:
        total += n
    return total / len(numbers)

def process_users(users=[]):
    users.append("new_user")
    return users

password = "admin123"
result = get_average([])
print(result)