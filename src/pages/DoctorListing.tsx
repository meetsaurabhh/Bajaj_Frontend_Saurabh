import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Grid,
  TextField,
  Paper,
  Typography,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Box,
  Card,
  CardContent,
  Autocomplete,
} from '@mui/material';
import { Doctor, FilterState } from '../types/doctor';

const API_URL = 'https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json';

const DoctorListing = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: searchParams.get('search') || '',
    consultationType: (searchParams.get('consultationType') as 'Video Consult' | 'In Clinic') || null,
    specialties: searchParams.get('specialties')?.split(',') || [],
    sortBy: (searchParams.get('sortBy') as 'fees' | 'experience') || null,
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [doctors, filterState]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...doctors];

    // Apply search filter
    if (filterState.searchQuery) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(filterState.searchQuery.toLowerCase())
      );
    }

    // Apply consultation type filter
    if (filterState.consultationType) {
      filtered = filtered.filter(
        doctor => doctor.consultationType === filterState.consultationType
      );
    }

    // Apply specialties filter
    if (filterState.specialties.length > 0) {
      filtered = filtered.filter(doctor =>
        filterState.specialties.every(specialty =>
          doctor.specialties.includes(specialty)
        )
      );
    }

    // Apply sorting
    if (filterState.sortBy === 'fees') {
      filtered.sort((a, b) => a.fee - b.fee);
    } else if (filterState.sortBy === 'experience') {
      filtered.sort((a, b) => b.experience - a.experience);
    }

    setFilteredDoctors(filtered);
  };

  const handleSearchChange = (value: string) => {
    setFilterState(prev => ({ ...prev, searchQuery: value }));
    setSearchParams(prev => {
      if (value) {
        prev.set('search', value);
      } else {
        prev.delete('search');
      }
      return prev;
    });
  };

  const handleConsultationTypeChange = (value: string) => {
    setFilterState(prev => ({ ...prev, consultationType: value as 'Video Consult' | 'In Clinic' }));
    setSearchParams(prev => {
      if (value) {
        prev.set('consultationType', value);
      } else {
        prev.delete('consultationType');
      }
      return prev;
    });
  };

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    setFilterState(prev => {
      const newSpecialties = checked
        ? [...prev.specialties, specialty]
        : prev.specialties.filter(s => s !== specialty);
      return { ...prev, specialties: newSpecialties };
    });
    setSearchParams(prev => {
      if (checked) {
        const currentSpecialties = prev.get('specialties')?.split(',') || [];
        prev.set('specialties', [...currentSpecialties, specialty].join(','));
      } else {
        const currentSpecialties = prev.get('specialties')?.split(',').filter(s => s !== specialty) || [];
        if (currentSpecialties.length > 0) {
          prev.set('specialties', currentSpecialties.join(','));
        } else {
          prev.delete('specialties');
        }
      }
      return prev;
    });
  };

  const handleSortChange = (value: string) => {
    setFilterState(prev => ({ ...prev, sortBy: value as 'fees' | 'experience' }));
    setSearchParams(prev => {
      if (value) {
        prev.set('sortBy', value);
      } else {
        prev.delete('sortBy');
      }
      return prev;
    });
  };

  const getUniqueSpecialties = () => {
    const specialties = new Set<string>();
    doctors.forEach(doctor => {
      doctor.specialties.forEach(specialty => specialties.add(specialty));
    });
    return Array.from(specialties);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Search Bar */}
        <Grid item xs={12}>
          <Autocomplete
            freeSolo
            options={doctors.map(doctor => doctor.name)}
            value={filterState.searchQuery}
            onChange={(_, value) => handleSearchChange(value || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                data-testid="autocomplete-input"
                label="Search Doctors"
                fullWidth
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} data-testid="suggestion-item">
                {option}
              </li>
            )}
            limit={3}
          />
        </Grid>

        {/* Filters */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom data-testid="filter-header-moc">
              Consultation Mode
            </Typography>
            <RadioGroup
              value={filterState.consultationType || ''}
              onChange={(e) => handleConsultationTypeChange(e.target.value)}
            >
              <FormControlLabel
                value="Video Consult"
                control={<Radio data-testid="filter-video-consult" />}
                label="Video Consult"
              />
              <FormControlLabel
                value="In Clinic"
                control={<Radio data-testid="filter-in-clinic" />}
                label="In Clinic"
              />
            </RadioGroup>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }} data-testid="filter-header-speciality">
              Speciality
            </Typography>
            {getUniqueSpecialties().map((specialty) => (
              <FormControlLabel
                key={specialty}
                control={
                  <Checkbox
                    checked={filterState.specialties.includes(specialty)}
                    onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)}
                    data-testid={`filter-specialty-${specialty.replace(/\s+/g, '-')}`}
                  />
                }
                label={specialty}
              />
            ))}

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }} data-testid="filter-header-sort">
              Sort By
            </Typography>
            <RadioGroup
              value={filterState.sortBy || ''}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <FormControlLabel
                value="fees"
                control={<Radio data-testid="sort-fees" />}
                label="Fees (Low to High)"
              />
              <FormControlLabel
                value="experience"
                control={<Radio data-testid="sort-experience" />}
                label="Experience (High to Low)"
              />
            </RadioGroup>
          </Paper>
        </Grid>

        {/* Doctor List */}
        <Grid item xs={12} md={9}>
          <Grid container spacing={2}>
            {filteredDoctors.map((doctor) => (
              <Grid item xs={12} sm={6} key={doctor.id}>
                <Card data-testid="doctor-card">
                  <CardContent>
                    <Typography variant="h6" data-testid="doctor-name">
                      {doctor.name}
                    </Typography>
                    <Typography color="textSecondary" data-testid="doctor-specialty">
                      {doctor.specialties.join(', ')}
                    </Typography>
                    <Typography variant="body2" data-testid="doctor-experience">
                      Experience: {doctor.experience} years
                    </Typography>
                    <Typography variant="body2" data-testid="doctor-fee">
                      Fee: ₹{doctor.fee}
                    </Typography>
                    <Typography variant="body2">
                      {doctor.consultationType}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DoctorListing; 