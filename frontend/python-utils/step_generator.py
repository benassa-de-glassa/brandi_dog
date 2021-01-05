# draw the board by walking to one step after another and choosing the direction where the next step will be
class Stepper:

    def __init__(self, x, y, u, hw_ratio=1):
        # supply initial coordinates from where the steps are taken
        self.x = x
        self.y = y

        self.ax = u/4*hw_ratio
        self.ay = u/4

        self.id = 0
        self.color_dict = {0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5'}

    def set_coords(self, x, y):
        self.x = x
        self.y = y

    def set_id(self, new_id):
        self.id = new_id

    def get_coords(self):
        # get the coordinates and do not increment the id
        return (self.x, self.y)

    def get_step(self):
        # create a step and increment the id
        s = {'id': self.id, 'x': self.x, 'y': self.y}
        self.id += 1
        return s

    def get_outer(self, color_id):
        # create coordinates for the circles around the steps
        return {'x': self.x, 'y': self.y, 'color': self.color_dict[color_id]}

    def get_house(self, color_id):
        s = {'id': self.id, 'x': self.x, 'y': self.y,
             'color': self.color_dict[color_id]}
        self.id += 1
        return s

    def get_home(self, color_id):
        s = {'id': -self.id-1, 'x': self.x,
             'y': self.y, 'color': self.color_dict[color_id]}
        self.id += 1
        return s

    def n(self, scale=1):
        self.y -= self.ay*scale

    def ne(self, scale=1):
        self.x += 0.7*self.ax*scale
        self.y -= 0.7*self.ay*scale

    def e(self, scale=1):
        self.x += self.ax*scale

    def se(self, scale=1):
        self.x += 0.7*self.ax*scale
        self.y += 0.7*self.ay*scale

    def s(self, scale=1):
        self.y += self.ay*scale

    def sw(self, scale=1):
        self.x -= 0.7*self.ax*scale
        self.y += 0.7*self.ay*scale

    def w(self, scale=1):
        self.x -= self.ax*scale

    def nw(self, scale=1):
        self.x -= 0.7*self.ax*scale
        self.y -= 0.7*self.ay*scale
