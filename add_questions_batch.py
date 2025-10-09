#!/usr/bin/env python3
"""
Script to add 10 questions to multiple question bank JSON files
"""
import json
import os

base_path = "/home/gss/Documents/projects/dts/247exams/data/"

# Question sets for each file
questions_to_add = {
    "03_chemistry_organic_question_bank.json": [
        {
            "text": "What is the IUPAC name of CH₃CH₂CH₂OH?",
            "question_type": "mcq",
            "options": ["Propanol", "1-Propanol", "2-Propanol", "Butanol"],
            "correct_answer": 1,
            "explanation": "CH₃CH₂CH₂OH is 1-propanol (n-propanol) with OH group on first carbon",
            "difficulty": "basic",
            "marks": 1,
            "topic": "Alcohols",
            "tags": ["alcohols", "iupac_naming", "propanol"]
        },
        {
            "text": "Which of the following undergoes SN1 reaction most readily?",
            "question_type": "mcq",
            "options": ["CH₃Br", "(CH₃)₂CHBr", "(CH₃)₃CBr", "CH₃CH₂Br"],
            "correct_answer": 2,
            "explanation": "Tertiary halides like (CH₃)₃CBr undergo SN1 most readily due to stable carbocation",
            "difficulty": "advanced",
            "marks": 3,
            "topic": "Reaction Mechanisms",
            "tags": ["SN1", "carbocation", "tertiary_halides"]
        },
        {
            "text": "What is the product of oxidation of secondary alcohol?",
            "question_type": "mcq",
            "options": ["Aldehyde", "Ketone", "Carboxylic acid", "Ester"],
            "correct_answer": 1,
            "explanation": "Secondary alcohols oxidize to ketones",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Alcohols",
            "tags": ["oxidation", "secondary_alcohol", "ketones"]
        },
        {
            "text": "Which reagent is used for Friedel-Crafts alkylation?",
            "question_type": "mcq",
            "options": ["AlCl₃", "NaOH", "H₂SO₄", "LiAlH₄"],
            "correct_answer": 0,
            "explanation": "AlCl₃ is the Lewis acid catalyst used in Friedel-Crafts alkylation",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Aromatic Compounds",
            "tags": ["friedel_crafts", "alkylation", "catalyst"]
        },
        {
            "text": "What is the hybridization of carbon in ethyne (C₂H₂)?",
            "question_type": "mcq",
            "options": ["sp", "sp²", "sp³", "sp³d"],
            "correct_answer": 0,
            "explanation": "Carbon in ethyne is sp hybridized with linear geometry",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Hydrocarbons",
            "tags": ["hybridization", "ethyne", "alkynes"]
        },
        {
            "text": "Which of the following is an example of elimination reaction?",
            "question_type": "mcq",
            "options": ["CH₃CH₂OH → CH₂=CH₂ + H₂O", "CH₄ + Cl₂ → CH₃Cl", "C₂H₄ + H₂ → C₂H₆", "CH₃COOH + CH₃OH → CH₃COOCH₃"],
            "correct_answer": 0,
            "explanation": "Dehydration of alcohol to alkene is an elimination reaction",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Reactions",
            "tags": ["elimination", "dehydration", "alkenes"]
        },
        {
            "text": "What is Markovnikov's rule?",
            "question_type": "mcq",
            "options": ["H adds to C with more H", "H adds to C with less H", "OH adds to more substituted C", "Br adds to less substituted C"],
            "correct_answer": 0,
            "explanation": "In addition reactions, H adds to the carbon with more hydrogen atoms",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Reactions",
            "tags": ["markovnikov_rule", "addition_reactions", "regioselectivity"]
        },
        {
            "text": "Which functional group is present in esters?",
            "question_type": "mcq",
            "options": ["-COOH", "-COO-", "-CHO", "-CO-"],
            "correct_answer": 1,
            "explanation": "Esters contain the -COO- functional group",
            "difficulty": "basic",
            "marks": 1,
            "topic": "Functional Groups",
            "tags": ["esters", "functional_groups", "carbonyl"]
        },
        {
            "text": "What is the general formula for cycloalkanes?",
            "question_type": "mcq",
            "options": ["CₙH₂ₙ₊₂", "CₙH₂ₙ", "CₙH₂ₙ₋₂", "CₙH₂ₙ₋₄"],
            "correct_answer": 1,
            "explanation": "Cycloalkanes have general formula CₙH₂ₙ due to ring structure",
            "difficulty": "basic",
            "marks": 1,
            "topic": "Hydrocarbons",
            "tags": ["cycloalkanes", "general_formula", "rings"]
        },
        {
            "text": "Which of the following shows tautomerism?",
            "question_type": "mcq",
            "options": ["CH₃CH₂OH", "CH₃COCH₃", "CH₃CHO", "CH₃CH₃"],
            "correct_answer": 1,
            "explanation": "Acetone (CH₃COCH₃) shows keto-enol tautomerism",
            "difficulty": "advanced",
            "marks": 3,
            "topic": "Isomerism",
            "tags": ["tautomerism", "keto_enol", "acetone"]
        }
    ],
    "05_chemistry_organic_question_bank.json": [
        {
            "text": "What type of isomerism is shown by butane and isobutane?",
            "question_type": "mcq",
            "options": ["Geometrical", "Optical", "Chain", "Position"],
            "correct_answer": 2,
            "explanation": "Butane and isobutane show chain isomerism (different carbon skeleton)",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Isomerism",
            "tags": ["chain_isomerism", "structural_isomerism", "butane"]
        },
        {
            "text": "Which catalyst is used in hydrogenation of alkenes?",
            "question_type": "mcq",
            "options": ["Pt/Pd/Ni", "AlCl₃", "H₂SO₄", "FeCl₃"],
            "correct_answer": 0,
            "explanation": "Platinum, Palladium, or Nickel catalysts are used for hydrogenation",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Reactions",
            "tags": ["hydrogenation", "catalysts", "alkenes"]
        },
        {
            "text": "What is the product when ethanol reacts with conc. H₂SO₄ at 170°C?",
            "question_type": "mcq",
            "options": ["Ethane", "Ethene", "Ethyne", "Ether"],
            "correct_answer": 1,
            "explanation": "Dehydration of ethanol at 170°C gives ethene (C₂H₄)",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Alcohols",
            "tags": ["dehydration", "ethanol", "alkenes"]
        },
        {
            "text": "Which of the following is aromatic?",
            "question_type": "mcq",
            "options": ["Cyclobutadiene", "Cyclooctatetraene", "Benzene", "Cyclohexane"],
            "correct_answer": 2,
            "explanation": "Benzene is aromatic following Huckel's rule (4n+2 π electrons)",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Aromatic Compounds",
            "tags": ["aromaticity", "huckel_rule", "benzene"]
        },
        {
            "text": "What is the IUPAC name of (CH₃)₂CHCOOH?",
            "question_type": "mcq",
            "options": ["2-Methylpropanoic acid", "3-Methylpropanoic acid", "Isobutyric acid", "Butanoic acid"],
            "correct_answer": 0,
            "explanation": "(CH₃)₂CHCOOH is 2-methylpropanoic acid",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Carboxylic Acids",
            "tags": ["iupac_naming", "carboxylic_acids", "branched"]
        },
        {
            "text": "Which reaction converts alkyl halide to alcohol?",
            "question_type": "mcq",
            "options": ["Hydrolysis", "Dehydration", "Oxidation", "Reduction"],
            "correct_answer": 0,
            "explanation": "Hydrolysis of alkyl halides produces alcohols",
            "difficulty": "basic",
            "marks": 1,
            "topic": "Reactions",
            "tags": ["hydrolysis", "alkyl_halides", "alcohols"]
        },
        {
            "text": "What is Saytzeff's rule?",
            "question_type": "mcq",
            "options": ["More substituted alkene forms", "Less substituted alkene forms", "Trans product forms", "Cis product forms"],
            "correct_answer": 0,
            "explanation": "In elimination reactions, the more substituted (stable) alkene is the major product",
            "difficulty": "advanced",
            "marks": 3,
            "topic": "Reactions",
            "tags": ["saytzeff_rule", "elimination", "alkenes"]
        },
        {
            "text": "Which compound shows highest boiling point?",
            "question_type": "mcq",
            "options": ["CH₃CH₂CH₃", "CH₃CHO", "CH₃CH₂OH", "CH₃OCH₃"],
            "correct_answer": 2,
            "explanation": "Alcohols have highest boiling point due to hydrogen bonding",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Physical Properties",
            "tags": ["boiling_point", "hydrogen_bonding", "alcohols"]
        },
        {
            "text": "What is the hybridization of nitrogen in amines?",
            "question_type": "mcq",
            "options": ["sp", "sp²", "sp³", "sp³d"],
            "correct_answer": 2,
            "explanation": "Nitrogen in amines is sp³ hybridized with pyramidal geometry",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Amines",
            "tags": ["hybridization", "amines", "nitrogen"]
        },
        {
            "text": "Which test is used to distinguish between aldehydes and ketones?",
            "question_type": "mcq",
            "options": ["Tollens' test", "Bromine water test", "Lucas test", "Beilstein test"],
            "correct_answer": 0,
            "explanation": "Tollens' test (silver mirror test) is positive for aldehydes, negative for ketones",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Carbonyl Compounds",
            "tags": ["tollens_test", "aldehydes", "ketones", "qualitative_analysis"]
        }
    ],
    "06_chemistry_inorganic_question_bank.json": [
        {
            "text": "What is the electronic configuration of Fe³⁺?",
            "question_type": "mcq",
            "options": ["[Ar]3d⁵", "[Ar]3d⁶", "[Ar]3d³", "[Ar]3d⁴"],
            "correct_answer": 0,
            "explanation": "Fe (26) loses 3 electrons: [Ar]3d⁶4s² → [Ar]3d⁵",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Electronic Configuration",
            "tags": ["transition_metals", "electronic_configuration", "iron"]
        },
        {
            "text": "Which of the following is amphoteric?",
            "question_type": "mcq",
            "options": ["NaOH", "HCl", "Al₂O₃", "CaO"],
            "correct_answer": 2,
            "explanation": "Al₂O₃ is amphoteric - reacts with both acids and bases",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Acids and Bases",
            "tags": ["amphoteric", "aluminum_oxide", "acid_base"]
        },
        {
            "text": "What is the shape of SF₆ molecule?",
            "question_type": "mcq",
            "options": ["Tetrahedral", "Square planar", "Octahedral", "Trigonal bipyramidal"],
            "correct_answer": 2,
            "explanation": "SF₆ has octahedral geometry with sp³d² hybridization",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Chemical Bonding",
            "tags": ["molecular_geometry", "vsepr", "hybridization"]
        },
        {
            "text": "Which noble gas is used in filling balloons?",
            "question_type": "mcq",
            "options": ["Helium", "Neon", "Argon", "Krypton"],
            "correct_answer": 0,
            "explanation": "Helium is used due to its low density and non-flammability",
            "difficulty": "basic",
            "marks": 1,
            "topic": "Noble Gases",
            "tags": ["noble_gases", "helium", "applications"]
        },
        {
            "text": "What is the oxidation state of Cr in K₂Cr₂O₇?",
            "question_type": "mcq",
            "options": ["+3", "+4", "+6", "+7"],
            "correct_answer": 2,
            "explanation": "2(+1) + 2(Cr) + 7(-2) = 0, so Cr = +6",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Oxidation States",
            "tags": ["oxidation_state", "chromium", "dichromate"]
        },
        {
            "text": "Which halogen is liquid at room temperature?",
            "question_type": "mcq",
            "options": ["Fluorine", "Chlorine", "Bromine", "Iodine"],
            "correct_answer": 2,
            "explanation": "Bromine is the only halogen that is liquid at room temperature",
            "difficulty": "basic",
            "marks": 1,
            "topic": "Halogens",
            "tags": ["halogens", "bromine", "physical_state"]
        },
        {
            "text": "What type of bond is present in NaCl?",
            "question_type": "mcq",
            "options": ["Covalent", "Ionic", "Metallic", "Hydrogen"],
            "correct_answer": 1,
            "explanation": "NaCl has ionic bonding between Na⁺ and Cl⁻ ions",
            "difficulty": "basic",
            "marks": 1,
            "topic": "Chemical Bonding",
            "tags": ["ionic_bonding", "sodium_chloride", "salts"]
        },
        {
            "text": "Which catalyst is used in Haber process?",
            "question_type": "mcq",
            "options": ["Iron", "Platinum", "Nickel", "Vanadium"],
            "correct_answer": 0,
            "explanation": "Iron catalyst is used in Haber process for ammonia synthesis",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Industrial Chemistry",
            "tags": ["haber_process", "ammonia", "catalysts"]
        },
        {
            "text": "What is the coordination number of Fe in [Fe(CN)₆]⁴⁻?",
            "question_type": "mcq",
            "options": ["4", "5", "6", "8"],
            "correct_answer": 2,
            "explanation": "Fe is surrounded by 6 CN⁻ ligands, so coordination number is 6",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Coordination Compounds",
            "tags": ["coordination_number", "complex_ions", "ligands"]
        },
        {
            "text": "Which element has highest electronegativity?",
            "question_type": "mcq",
            "options": ["Oxygen", "Fluorine", "Chlorine", "Nitrogen"],
            "correct_answer": 1,
            "explanation": "Fluorine has the highest electronegativity (4.0 on Pauling scale)",
            "difficulty": "basic",
            "marks": 1,
            "topic": "Periodic Properties",
            "tags": ["electronegativity", "fluorine", "periodic_trends"]
        }
    ],
    "02_physics_advanced_question_bank.json": [
        {
            "text": "What is the de Broglie wavelength of an electron moving at 10⁶ m/s?",
            "question_type": "mcq",
            "options": ["7.3 × 10⁻¹⁰ m", "7.3 × 10⁻⁸ m", "7.3 × 10⁻¹² m", "7.3 × 10⁻⁶ m"],
            "correct_answer": 0,
            "explanation": "λ = h/mv = 6.63×10⁻³⁴/(9.1×10⁻³¹ × 10⁶) ≈ 7.3×10⁻¹⁰ m",
            "difficulty": "advanced",
            "marks": 3,
            "topic": "Quantum Mechanics",
            "tags": ["de_broglie", "wave_particle_duality", "wavelength"]
        },
        {
            "text": "What is the uncertainty principle equation?",
            "question_type": "mcq",
            "options": ["ΔxΔp ≥ ħ/2", "ΔEΔt ≥ ħ", "Both", "Neither"],
            "correct_answer": 2,
            "explanation": "Both forms are valid: position-momentum and energy-time uncertainty relations",
            "difficulty": "advanced",
            "marks": 3,
            "topic": "Quantum Mechanics",
            "tags": ["uncertainty_principle", "heisenberg", "quantum"]
        },
        {
            "text": "In special relativity, what happens to mass as velocity approaches c?",
            "question_type": "mcq",
            "options": ["Decreases", "Remains constant", "Approaches infinity", "Becomes zero"],
            "correct_answer": 2,
            "explanation": "Relativistic mass m = m₀/√(1-v²/c²) approaches infinity as v→c",
            "difficulty": "advanced",
            "marks": 3,
            "topic": "Relativity",
            "tags": ["special_relativity", "relativistic_mass", "lorentz_factor"]
        },
        {
            "text": "What is the energy of a photon with frequency ν?",
            "question_type": "mcq",
            "options": ["E = hν", "E = mc²", "E = ½mv²", "E = kT"],
            "correct_answer": 0,
            "explanation": "Photon energy is given by Planck's equation E = hν",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Quantum Physics",
            "tags": ["photon_energy", "planck_equation", "frequency"]
        },
        {
            "text": "What is the Schwarzschild radius?",
            "question_type": "mcq",
            "options": ["Event horizon radius", "Neutron star radius", "Atomic radius", "Planetary orbit"],
            "correct_answer": 0,
            "explanation": "Schwarzschild radius defines the event horizon of a non-rotating black hole",
            "difficulty": "advanced",
            "marks": 3,
            "topic": "General Relativity",
            "tags": ["black_holes", "event_horizon", "general_relativity"]
        },
        {
            "text": "What is the spin of an electron?",
            "question_type": "mcq",
            "options": ["0", "1/2", "1", "3/2"],
            "correct_answer": 1,
            "explanation": "Electrons are fermions with spin 1/2",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Quantum Mechanics",
            "tags": ["electron_spin", "fermions", "quantum_numbers"]
        },
        {
            "text": "What is time dilation formula in special relativity?",
            "question_type": "mcq",
            "options": ["Δt = Δt₀γ", "Δt = Δt₀/γ", "Δt = Δt₀", "Δt = cΔt₀"],
            "correct_answer": 0,
            "explanation": "Time dilation: Δt = Δt₀γ where γ = 1/√(1-v²/c²)",
            "difficulty": "advanced",
            "marks": 3,
            "topic": "Relativity",
            "tags": ["time_dilation", "lorentz_transformation", "relativity"]
        },
        {
            "text": "What is the ground state energy of hydrogen atom?",
            "question_type": "mcq",
            "options": ["-13.6 eV", "-27.2 eV", "-3.4 eV", "-6.8 eV"],
            "correct_answer": 0,
            "explanation": "Ground state energy of hydrogen is -13.6 eV",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Atomic Physics",
            "tags": ["hydrogen_atom", "energy_levels", "bohr_model"]
        },
        {
            "text": "What particles are affected by strong nuclear force?",
            "question_type": "mcq",
            "options": ["Quarks only", "Leptons only", "Quarks and gluons", "All particles"],
            "correct_answer": 2,
            "explanation": "Strong force affects quarks and is mediated by gluons",
            "difficulty": "advanced",
            "marks": 3,
            "topic": "Particle Physics",
            "tags": ["strong_force", "quarks", "gluons"]
        },
        {
            "text": "What is Compton scattering?",
            "question_type": "mcq",
            "options": ["Photon-electron collision", "Electron-electron collision", "Photon absorption", "Pair production"],
            "correct_answer": 0,
            "explanation": "Compton scattering is inelastic scattering of photons by electrons",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Quantum Physics",
            "tags": ["compton_scattering", "photons", "electrons"]
        }
    ],
    "03_physics_mechanics_question_bank.json": [
        {
            "text": "What is the moment of inertia of a solid sphere about its diameter?",
            "question_type": "mcq",
            "options": ["(2/3)MR²", "(2/5)MR²", "(1/2)MR²", "MR²"],
            "correct_answer": 1,
            "explanation": "For a solid sphere about diameter: I = (2/5)MR²",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Rotational Motion",
            "tags": ["moment_of_inertia", "solid_sphere", "rotation"]
        },
        {
            "text": "What is angular momentum?",
            "question_type": "mcq",
            "options": ["L = Iω", "L = mv", "L = Fr", "L = ma"],
            "correct_answer": 0,
            "explanation": "Angular momentum L = Iω (moment of inertia × angular velocity)",
            "difficulty": "basic",
            "marks": 1,
            "topic": "Rotational Motion",
            "tags": ["angular_momentum", "rotation", "conservation"]
        },
        {
            "text": "A ball is thrown vertically upward. At maximum height, what is its acceleration?",
            "question_type": "mcq",
            "options": ["0", "g upward", "g downward", "2g downward"],
            "correct_answer": 2,
            "explanation": "At maximum height, velocity is zero but acceleration is still g downward",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Kinematics",
            "tags": ["projectile_motion", "acceleration", "gravity"]
        },
        {
            "text": "What is the condition for static equilibrium?",
            "question_type": "mcq",
            "options": ["ΣF = 0", "Στ = 0", "Both ΣF = 0 and Στ = 0", "Neither"],
            "correct_answer": 2,
            "explanation": "Static equilibrium requires both net force and net torque to be zero",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Statics",
            "tags": ["equilibrium", "forces", "torque"]
        },
        {
            "text": "What is the centripetal acceleration formula?",
            "question_type": "mcq",
            "options": ["a = v²/r", "a = vr", "a = v/r", "a = r/v"],
            "correct_answer": 0,
            "explanation": "Centripetal acceleration a = v²/r directed toward center",
            "difficulty": "basic",
            "marks": 1,
            "topic": "Circular Motion",
            "tags": ["centripetal_acceleration", "circular_motion", "dynamics"]
        },
        {
            "text": "What is the work-energy theorem?",
            "question_type": "mcq",
            "options": ["W = ΔKE", "W = ΔPE", "W = F×d", "W = P×t"],
            "correct_answer": 0,
            "explanation": "Work-energy theorem: Net work done equals change in kinetic energy",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Work and Energy",
            "tags": ["work_energy_theorem", "kinetic_energy", "work"]
        },
        {
            "text": "What happens in a perfectly elastic collision?",
            "question_type": "mcq",
            "options": ["KE conserved only", "Momentum conserved only", "Both KE and momentum conserved", "Neither conserved"],
            "correct_answer": 2,
            "explanation": "In elastic collisions, both kinetic energy and momentum are conserved",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Collisions",
            "tags": ["elastic_collision", "conservation_laws", "momentum"]
        },
        {
            "text": "What is the period of a simple pendulum?",
            "question_type": "mcq",
            "options": ["T = 2π√(L/g)", "T = 2π√(g/L)", "T = √(L/g)", "T = 2πLg"],
            "correct_answer": 0,
            "explanation": "Period of simple pendulum T = 2π√(L/g) where L is length",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Simple Harmonic Motion",
            "tags": ["pendulum", "period", "shm"]
        },
        {
            "text": "What is the escape velocity from Earth?",
            "question_type": "mcq",
            "options": ["7.9 km/s", "11.2 km/s", "15.0 km/s", "20.0 km/s"],
            "correct_answer": 1,
            "explanation": "Escape velocity from Earth is approximately 11.2 km/s",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Gravitation",
            "tags": ["escape_velocity", "gravitation", "orbital_mechanics"]
        },
        {
            "text": "What is Hooke's law?",
            "question_type": "mcq",
            "options": ["F = -kx", "F = ma", "F = μN", "F = qE"],
            "correct_answer": 0,
            "explanation": "Hooke's law: F = -kx (restoring force proportional to displacement)",
            "difficulty": "basic",
            "marks": 1,
            "topic": "Elasticity",
            "tags": ["hookes_law", "springs", "elasticity"]
        }
    ],
    "04_physics_thermodynamics_question_bank.json": [
        {
            "text": "What is the efficiency of a Carnot engine?",
            "question_type": "mcq",
            "options": ["η = 1 - T_cold/T_hot", "η = T_hot/T_cold", "η = W/Q", "η = Q/W"],
            "correct_answer": 0,
            "explanation": "Carnot efficiency η = 1 - T_c/T_h (temperatures in Kelvin)",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Heat Engines",
            "tags": ["carnot_engine", "efficiency", "thermodynamics"]
        },
        {
            "text": "What is the first law of thermodynamics?",
            "question_type": "mcq",
            "options": ["ΔU = Q - W", "ΔS ≥ 0", "PV = nRT", "Q = mcΔT"],
            "correct_answer": 0,
            "explanation": "First law: ΔU = Q - W (change in internal energy = heat added - work done)",
            "difficulty": "basic",
            "marks": 1,
            "topic": "Laws of Thermodynamics",
            "tags": ["first_law", "internal_energy", "conservation"]
        },
        {
            "text": "In an isothermal process, what remains constant?",
            "question_type": "mcq",
            "options": ["Pressure", "Volume", "Temperature", "Heat"],
            "correct_answer": 2,
            "explanation": "In isothermal process, temperature remains constant",
            "difficulty": "basic",
            "marks": 1,
            "topic": "Thermodynamic Processes",
            "tags": ["isothermal", "temperature", "processes"]
        },
        {
            "text": "What is entropy?",
            "question_type": "mcq",
            "options": ["Measure of disorder", "Measure of energy", "Measure of temperature", "Measure of pressure"],
            "correct_answer": 0,
            "explanation": "Entropy is a measure of disorder or randomness in a system",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Entropy",
            "tags": ["entropy", "disorder", "second_law"]
        },
        {
            "text": "What is the ideal gas equation?",
            "question_type": "mcq",
            "options": ["PV = nRT", "PV = RT", "P = nRT/V", "Both A and C"],
            "correct_answer": 3,
            "explanation": "Ideal gas equation: PV = nRT, which can be rearranged as P = nRT/V",
            "difficulty": "basic",
            "marks": 1,
            "topic": "Ideal Gas",
            "tags": ["ideal_gas_law", "equation_of_state", "gases"]
        },
        {
            "text": "In an adiabatic process, what is zero?",
            "question_type": "mcq",
            "options": ["Work done", "Heat transfer", "Temperature change", "Pressure change"],
            "correct_answer": 1,
            "explanation": "In adiabatic process, there is no heat transfer (Q = 0)",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Thermodynamic Processes",
            "tags": ["adiabatic", "heat_transfer", "processes"]
        },
        {
            "text": "What is specific heat capacity?",
            "question_type": "mcq",
            "options": ["Heat per unit mass per degree", "Total heat capacity", "Heat per mole", "Heat at constant volume"],
            "correct_answer": 0,
            "explanation": "Specific heat capacity is heat required to raise temperature of unit mass by one degree",
            "difficulty": "basic",
            "marks": 1,
            "topic": "Heat Capacity",
            "tags": ["specific_heat", "heat_capacity", "thermal_properties"]
        },
        {
            "text": "What is the relation between Cp and Cv for ideal gas?",
            "question_type": "mcq",
            "options": ["Cp - Cv = R", "Cp + Cv = R", "Cp/Cv = R", "Cp × Cv = R"],
            "correct_answer": 0,
            "explanation": "For ideal gas: Cp - Cv = R (Mayer's relation)",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Heat Capacity",
            "tags": ["heat_capacity", "mayers_relation", "ideal_gas"]
        },
        {
            "text": "What is a reversible process?",
            "question_type": "mcq",
            "options": ["Process that can be reversed", "Process with no friction", "Quasi-static process", "All of the above"],
            "correct_answer": 3,
            "explanation": "Reversible process is quasi-static, can be reversed, and has no dissipation",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Thermodynamic Processes",
            "tags": ["reversible_process", "quasi_static", "ideal_processes"]
        },
        {
            "text": "What is the Clausius statement of second law?",
            "question_type": "mcq",
            "options": ["Heat flows from hot to cold", "No perfect heat engine", "Entropy always increases", "Energy is conserved"],
            "correct_answer": 0,
            "explanation": "Clausius: Heat cannot spontaneously flow from cold to hot body",
            "difficulty": "intermediate",
            "marks": 2,
            "topic": "Laws of Thermodynamics",
            "tags": ["second_law", "clausius_statement", "heat_flow"]
        }
    ]
}

def add_questions_to_file(filename, questions):
    """Add questions to a specific JSON file"""
    filepath = os.path.join(base_path, filename)
    
    try:
        # Read existing file
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Add new questions
        if 'questions' in data:
            data['questions'].extend(questions)
            
            # Write back
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Added {len(questions)} questions to {filename}")
            return True
    except Exception as e:
        print(f"❌ Error with {filename}: {str(e)}")
        return False

# Process all files
successful = 0
for filename, questions in questions_to_add.items():
    if add_questions_to_file(filename, questions):
        successful += 1

print(f"\n📊 Summary: Successfully updated {successful}/{len(questions_to_add)} files")
print("Each file now has 10 additional questions!")