from django import forms
from .models import DemandeMentorat, Matiere

class DemandeMentoratForm(forms.ModelForm):
    class Meta:
        model = DemandeMentorat
        fields = ['matiere', 'message']
        labels = {
            'matiere': 'Matière / Domaine concerné',
            'message': 'Votre message au mentor',
        }
        widgets = {
            'message': forms.Textarea(attrs={
                'rows': 4,
                'placeholder': 'Expliquez en quelques lignes vos difficultés, le sujet du projet ou les points sur lesquels vous aimeriez progresser...',
                'class': 'form-control',
            }),
            'matiere': forms.Select(attrs={'class': 'form-select'}),
        }

    def __init__(self, mentor=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if mentor:
            # Ne proposer que les matières que ce mentor maîtrise
            matieres_ids = mentor.competences.values_list('matiere_id', flat=True)
            self.fields['matiere'].queryset = Matiere.objects.filter(id__in=matieres_ids)
