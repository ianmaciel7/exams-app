"use client";

import type { CountryCode, CountryData } from "@firebase-oss/ui-core";
import {
  type CountrySelectorProps,
  type CountrySelectorRef,
  useCountries,
  useDefaultCountry,
} from "@firebase-oss/ui-react";
import { useTranslations } from "next-intl";
import { type Ref, useImperativeHandle, useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CountrySelectProps = Omit<CountrySelectorProps, "ref"> & {
  ref?: Ref<CountrySelectorRef>;
};

function CountrySelect({ ref }: CountrySelectProps) {
  const t = useTranslations("auth");
  const countries = useCountries();
  const defaultCountry = useDefaultCountry();
  const [selected, setSelected] = useState<CountryData>(defaultCountry);

  useImperativeHandle(
    ref,
    () => ({
      getCountry: () => selected,
      setCountry: (code: CountryCode) => {
        const foundCountry = countries.find((country) => country.code === code);
        if (foundCountry) {
          setSelected(foundCountry);
        }
      },
    }),
    [countries, selected]
  );

  return (
    <Select
      items={countries.map((country) => ({
        label: `${country.dialCode} (${country.name})`,
        value: country.code,
      }))}
      value={selected.code}
      onValueChange={(code) => {
        if (code) {
          const foundCountry = countries.find(
            (country) => country.code === code
          );
          if (foundCountry) {
            setSelected(foundCountry);
          }
        }
      }}
    >
      <SelectTrigger
        data-slot="country-select"
        className="w-30"
        aria-label={t("countrySelector")}
      >
        <SelectValue>
          {selected.code} {selected.dialCode}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.dialCode} ({country.name})
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export { CountrySelect, type CountrySelectProps, type CountrySelectorRef };
