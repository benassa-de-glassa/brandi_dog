class User():
    """
    this is a test class and should not be necessary in the actual implementation

    """

    def __init__(self, name, uid):
        self.username = name
        self.uid = uid

    def to_json(self):
        return {
            'uid': self.uid,
            'username': self.name
        }
