from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import Profile

class CustomUserCreationForm(UserCreationForm):
    first_name = forms.CharField(max_length=30, required=True, label="Prénom")
    last_name = forms.CharField(max_length=30, required=True, label="Nom")
    email = forms.EmailField(required=True, label="Adresse Email")
    
    role = forms.ChoiceField(choices=Profile.ROLE_CHOICES, label="Votre Rôle", initial='MENTORE')
    filiere = forms.CharField(max_length=150, required=False, label="Filière / Spécialité")
    niveau = forms.ChoiceField(choices=Profile.NIVEAU_CHOICES, label="Niveau d'études", initial='L1')
    bio = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}), required=False, label="Petite présentation")

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'role', 'filiere', 'niveau', 'bio')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
            profile = user.profile
            profile.role = self.cleaned_data['role']
            profile.filiere = self.cleaned_data['filiere']
            profile.niveau = self.cleaned_data['niveau']
            profile.bio = self.cleaned_data['bio']
            profile.save()
        return user


class ProfileUpdateForm(forms.ModelForm):
    first_name = forms.CharField(max_length=30, required=True, label="Prénom")
    last_name = forms.CharField(max_length=30, required=True, label="Nom")
    email = forms.EmailField(required=True, label="Adresse Email")

    class Meta:
        model = Profile
        fields = ['role', 'filiere', 'niveau', 'bio', 'telephone', 'est_disponible']
        labels = {
            'role': 'Rôle sur la plateforme',
            'filiere': 'Filière / Spécialité',
            'niveau': "Niveau d'études",
            'bio': 'Biographie / Description',
            'telephone': 'Numéro WhatsApp / Contact',
            'est_disponible': 'Disponible pour du mentorat',
        }
        widgets = {
            'bio': forms.Textarea(attrs={'rows': 3}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.user:
            self.fields['first_name'].initial = self.instance.user.first_name
            self.fields['last_name'].initial = self.instance.user.last_name
            self.fields['email'].initial = self.instance.user.email

    def save(self, commit=True):
        profile = super().save(commit=False)
        user = profile.user
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
            profile.save()
        return profile
