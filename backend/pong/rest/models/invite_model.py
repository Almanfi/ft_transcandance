from django.db import models
import uuid

INVITE_TYPE = [
    ('game', "Game"),
    ('tourney', "Tourney")
]

class Invite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(choices=INVITE_TYPE, default=INVITE_TYPE[0][0])
    game = models.ForeignKey('Game', on_delete=models.CASCADE)
    seen = models.BooleanField(default=False)
    inviter = models.ForeignKey('User',related_name="game_inviter", on_delete=models.CASCADE)
    invited = models.ForeignKey('User',related_name="game_invited",on_delete=models.CASCADE)
    accepted = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=["invited"], name="invited_idx"),
            models.Index(fields=["game"], name="game_idx")
        ]

    @staticmethod
    def player_is_invited(game, invited):
        return Invite.objects.filter(game=game, invited=invited).exists()

    @staticmethod
    def create_new_game_invite(inviter, invited, game):
        new_invitation = Invite.objects.create(type=INVITE_TYPE[0][0], game = game, inviter=inviter, invited=invited)
        return new_invitation
    
    @staticmethod
    def create_matchmaking_invite(game, inviter, invited):
        accepted_invitation = Invite.objects.create(type=INVITE_TYPE[0][0], game=game, inviter=inviter, invited=invited, accepted=True)
        return accepted_invitation

    @staticmethod
    def fetch_invites_by_id(invites):
        invites = Invite.objects.filter(pk__in=invites)
        return list(invites)
    
    @staticmethod
    def fetch_user_game_invite(game, user):
        invite = Invite.objects.filter(game=game, invited=user)
        return list(invite)
    