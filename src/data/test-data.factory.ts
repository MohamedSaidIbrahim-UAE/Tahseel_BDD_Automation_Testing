import { faker } from '@faker-js/faker';
import { UserRegistrationData } from '../models/user.model';

export interface EquipmentBrandData {
  arabicName: string;
  englishName: string;
  isActive: boolean;
}

export interface EquipmentTypeData {
  arabicName: string;
  englishName: string;
  deviceType: string;
  isActive: boolean;
}

export interface EquipmentInstanceData {
  equipmentType: string;
  equipmentStatus: string;
  equipmentBrand: string;
  englishName: string;
  arabicName: string;
  modelYear: string;
  serialNumber: string;
  firmwareVersion: string;
  isActive: boolean;
}

export interface PlazaWorkingHoursData {
  plaza: string;
  lane: string;
  day: string;
  isWorking: boolean;
  beginTime: string;
  endTime: string;
  isActive: boolean;
}

export interface SystemParameterData {
  parameterGroup: string;
  nameAr: string;
  nameEn: string;
  code: string;
  valueType: string;
  scope: string;
  status: string;
  displayOrder: string;
  valueInt?: string;
  valueDecimal?: string;
}

export interface ServiceCatalogueData {
  deptCode: string;
  deptNameEn: string;
  deptNameAr: string;
  subDeptCode: string;
  subDeptNameEn: string;
  subDeptNameAr: string;
  categoryCode: string;
  categoryNameEn: string;
  categoryNameAr: string;
  serviceCode: string;
  serviceNameEn: string;
  serviceNameAr: string;
  isActive: boolean;
}

export interface TruckClassificationData {
  className: string;
  axleCount: string;
  vehicleLength: string;
  vehicleHeight: string;
  vehicleWidth: string;
  grossVehicleWeight: string;
  isActive: boolean;
}

export interface TollableClassificationData {
  tollableClassName: string;
  deptServiceCode: string;
  truckClassification: string;
  isActive: boolean;
}

export interface FeeData {
  feeName: string;
  feeDescription: string;
  price: string;
  startDate: string;
  endDate: string;
  tollableClassification: string;
  isActive: boolean;
}

export interface MaintenanceData {
  sentForMaintenanceDate: string;
  expectedReturnDate: string;
  maintenanceReason: string;
  maintenanceProvider: string;
  cost: string;
  workPerformed: string;
}

export class TestDataFactory {
  static generateUser(): UserRegistrationData {
    return {
      username: faker.internet.username(),
      password: faker.internet.password({ length: 12 }),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zip: faker.location.zipCode(),
      phone: faker.phone.number()
    };
  }

  static generateCreditCard() {
    return {
      cardType: faker.helpers.arrayElement(['Visa', 'MasterCard', 'Amex']),
      cardNumber: faker.finance.creditCardNumber(),
      expiryMonth: faker.date.future().getMonth() + 1,
      expiryYear: faker.date.future().getFullYear(),
      cvv: faker.finance.creditCardCVV(),
      cardholderName: faker.person.fullName()
    };
  }

  static generatePlazaWorkingHours(): PlazaWorkingHoursData {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    return {
      plaza: 'Zubair',
      lane: 'Lane 3',
      day: faker.helpers.arrayElement(days),
      isWorking: true,
      beginTime: '08:00',
      endTime: '20:00',
      isActive: true,
    };
  }

  static generateSystemParameter(): SystemParameterData {
    const suffix = faker.string.alphanumeric(5).toUpperCase();
    return {
      parameterGroup: 'Tolling',
      nameAr: `معامل_${suffix}`,
      nameEn: `Param_${suffix}`,
      code: `PARAM_${suffix}`,
      valueType: 'Integer',
      scope: 'Global',
      status: 'Active',
      displayOrder: String(faker.number.int({ min: 1, max: 99 })),
      valueInt: String(faker.number.int({ min: 1, max: 100 })),
    };
  }

  static generateServiceCatalogue(): ServiceCatalogueData {
    const s = faker.string.alphanumeric(4).toUpperCase();
    return {
      deptCode: `D${s}`,
      deptNameEn: `Dept_${s}`,
      deptNameAr: `قسم_${s}`,
      subDeptCode: `SD${s}`,
      subDeptNameEn: `SubDept_${s}`,
      subDeptNameAr: `فرعي_${s}`,
      categoryCode: `C${s}`,
      categoryNameEn: `Cat_${s}`,
      categoryNameAr: `فئة_${s}`,
      serviceCode: `SVC${s}`,
      serviceNameEn: `Service_${s}`,
      serviceNameAr: `خدمة_${s}`,
      isActive: true,
    };
  }

  static generateTruckClassification(): TruckClassificationData {
    const suffix = faker.string.alphanumeric(4).toUpperCase();
    return {
      className: `Class_${suffix}`,
      axleCount: String(faker.number.int({ min: 2, max: 6 })),
      vehicleLength: faker.number.float({ min: 5, max: 20, fractionDigits: 1 }).toFixed(1),
      vehicleHeight: faker.number.float({ min: 2, max: 5, fractionDigits: 1 }).toFixed(1),
      vehicleWidth: faker.number.float({ min: 2, max: 3, fractionDigits: 1 }).toFixed(1),
      grossVehicleWeight: String(faker.number.int({ min: 10, max: 50 })),
      isActive: true,
    };
  }

  static generateTollableClassification(): TollableClassificationData {
    const suffix = faker.string.alphanumeric(4).toUpperCase();
    return {
      tollableClassName: `TollClass_${suffix}`,
      deptServiceCode: 'SRTA',
      truckClassification: '2-Axle',
      isActive: true,
    };
  }

  static generateFee(): FeeData {
    const suffix = faker.string.alphanumeric(4).toUpperCase();
    const fmt = (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    const start = new Date(2026, 1, 1);
    const end = new Date(2026, 11, 31);
    return {
      feeName: `Fee_${suffix}`,
      feeDescription: `Auto-generated fee ${suffix}`,
      price: String(faker.number.int({ min: 5, max: 200 })),
      startDate: fmt(start),
      endDate: fmt(end),
      tollableClassification: 'Small Truck',
      isActive: true,
    };
  }

  static generateEquipmentType(): EquipmentTypeData {
    const suffix = faker.string.alphanumeric(4).toUpperCase();
    return {
      arabicName: `نوع ${suffix}`,
      englishName: `Type_${suffix}`,
      deviceType: String(faker.number.int({ min: 1, max: 9 })),
      isActive: true,
    };
  }

  static generateEquipmentInstance(): EquipmentInstanceData {
    const suffix = faker.string.alphanumeric(5).toUpperCase();
    return {
      equipmentType: 'ANPR',
      equipmentStatus: 'In Stock',
      equipmentBrand: 'Star Link',
      englishName: `CAM_${suffix}`,
      arabicName: `كاميرا_${suffix}`,
      modelYear: String(faker.number.int({ min: 2020, max: 2026 })),
      serialNumber: `SN-${suffix}`,
      firmwareVersion: `v${faker.number.int({ min: 1, max: 5 })}.${faker.number.int({ min: 0, max: 9 })}.0`,
      isActive: true,
    };
  }

  static generateMaintenanceData(): MaintenanceData {
    const today = new Date();
    const future = new Date(today);
    future.setDate(today.getDate() + 14);
    const fmt = (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    return {
      sentForMaintenanceDate: fmt(today),
      expectedReturnDate: fmt(future),
      maintenanceReason: faker.lorem.sentence(5),
      maintenanceProvider: `Provider_${faker.string.alphanumeric(4).toUpperCase()}`,
      cost: String(faker.number.int({ min: 100, max: 9999 })),
      workPerformed: faker.lorem.sentence(8),
    };
  }

  static generateEquipmentBrand(): EquipmentBrandData {
    const suffix = faker.string.alphanumeric(4).toUpperCase();
    return {
      arabicName: `علامة ${suffix}`,
      englishName: `Brand_${suffix}`,
      isActive: true,
    };
  }

  static generateAddress() {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country()
    };
  }
}
