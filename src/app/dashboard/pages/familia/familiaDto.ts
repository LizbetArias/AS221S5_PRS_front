// family.dto.ts
export interface FamilyDTO {
    id: number;
    direction: string;
    reasibAdmission: string;
    status: string;
    basicService: BasicService;
    communityEnvironment: CommunityEnvironment;
    familyComposition: FamilyComposition;
    familyFeeding: FamilyFeeding;
    familyHealth: FamilyHealth;
    housingDistribution: HousingDistribution;
    housingEnvironment: HousingEnvironment;
    laborAutonomy: LaborAutonomy;
    socialLife: SocialLife;
}

export interface BasicService {
    serviceId: number;
    waterService: boolean;
    servDrain: boolean;
    servLight: boolean;
    servCable: boolean;
    servGas: boolean;
}

export interface CommunityEnvironment {
    id: number;
    area: string;
    referenceLocation: string;
    residue: boolean;
    publicLighting: boolean;
    security: boolean;
}

export interface FamilyComposition{
    id: number;
    numbreChildren: number;
    SocialLife: string;
    socialProblems:string
}

export interface FamilyFeeding{
    id: number;
    frecuenciaSemanal: string;
    tipoAlimentacion: string
}

export interface FamilyHealth{
    id: number;
    safeType: string;
    familyDisease: string;
    treatment: string;
    antecedentesEnfermedad: string;
    examenMedico: string
}

export interface HousingDistribution{
    id: number;
    ambienteHogar: number;
    numeroDormitorio: number;
    habitabilidad: string
}

export interface HousingEnvironment{
    id: number;
    tenure: string;
    typeOfHousing: string;
    housingMaterial: string;
    housingSecurity: string
}

export interface LaborAutonomy{
    id: number
}


export interface SocialLife{
    
}


