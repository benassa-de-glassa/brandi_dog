"""
Attempt to avoid circular imports by having globally used variables in one place only.
"""

# store all currently playing users in a dictionary of {player_id: game_id}
playing_users = {}

# store all socket ids in a dictionary of {user id: socket id}
socket_connections = {}