import {
  CheckboxGroup,
  NamedCheckboxGroup,
  BoxlessCheckboxGroup,
  SingleCheckbox,
  PillSearch,
  NumberSelector,
} from '../advanced/index.ts';
import {
  TextInput,
  FormField,
  PrimaryButton,
  ButtonColors,
  inputColors,
  Box,
} from '@workday/canvas-kit-react';

import { useAtom } from 'jotai';
import { inputSortAtom, queryAtom, sortAtom } from '../atoms/searchAtoms.ts';
import { useEffect, useState } from 'react';
import { HCSearchColors } from '@hellfall/shared/types';
import { looseOpList, looseOpType, parseSorts } from '@hellfall/shared/filters';
import { ControlBar } from '../search-controls/ControlBar.tsx';
import { useNavToSearch } from '../hooks/useUrlSync.ts';
import { extraSetList, normalizeText } from '@hellfall/shared/utils';
import { creatorsData, pipsData, tagsData, typesData } from '@hellfall/shared/data';
import { componentHolderStyles, labelStyles, legendStyles } from './advancedStyles.ts';
import { createStyles } from '@workday/canvas-kit-styling';
import { Link } from 'react-router-dom';

export const AdvancedSearch = () => {
  const [idSearch, setIdSearch] = useState<string>('');
  const [nameSearch, setNameSearch] = useState<string[]>([]);
  const [costSearch, setCostSearch] = useState<string[]>([]);
  const [typeSearch, setTypeSearch] = useState<string[]>([]);
  const [rulesSearch, setRulesSearch] = useState<string[]>([]);
  const [flavorSearch, setFlavorSearch] = useState<string[]>([]);
  const [creators, setCreators] = useState<string[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [searchColors, setSearchColors] = useState<string[]>([]);
  const [colorComparison, setColorComparison] = useState<looseOpType>(':');
  const [colorNumber, setColorNumber] = useState<[number | undefined, looseOpType]>([
    undefined,
    ':',
  ]);
  const [searchColorIdentities, setSearchColorIdentities] = useState<string[]>([]);
  const [colorIdentityComparison, setColorIdentityComparison] = useState<looseOpType>(':');
  const [hybridIdentityRule, setHybridIdentityRule] = useState(false);
  const [colorIdentityNumber, setColorIdentityNumber] = useState<[number | undefined, looseOpType]>(
    [undefined, ':']
  );
  const [searchSet, setSearchSet] = useState<string[]>([]);
  const [includeExtraSets, setIncludeExtraSets] = useState(false);
  const [extraSets, setExtraSets] = useState<string[]>([]);
  const [searchToken, setSearchToken] = useState<'Cards' | 'Tokens' | 'Both'>('Cards');
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [standardLegality, setStandardLegality] = useState<'' | 'legal' | 'not_legal' | 'banned'>(
    ''
  );
  const [fourcbLegality, set4cbLegality] = useState<'' | 'legal' | 'not_legal' | 'banned'>('');
  const [commanderLegality, setCommanderLegality] = useState<'' | 'legal' | 'not_legal' | 'banned'>(
    ''
  );
  const [isCommander, setIsCommander] = useState(false);
  const [legalityOpen, setLegalityOpen] = useState(false);
  const [collectorNumber, setCollectorNumber] = useState<[number | undefined, looseOpType]>([
    undefined,
    ':',
  ]);
  const [manaValue, setManaValue] = useState<[number | undefined, looseOpType]>([undefined, ':']);
  const [power, setPower] = useState<[number | undefined, looseOpType]>([undefined, ':']);
  const [toughness, setToughness] = useState<[number | undefined, looseOpType]>([undefined, ':']);
  const [loyalty, setLoyalty] = useState<[number | undefined, looseOpType]>([undefined, ':']);
  const [defense, setDefense] = useState<[number | undefined, looseOpType]>([undefined, ':']);

  const [inputSorts, setInputSorts] = useAtom(inputSortAtom);
  const [sortRules, setSortRules] = useAtom(sortAtom);

  const [query, setQuery] = useAtom(queryAtom);
  const [localQuery, setLocalQuery] = useState('');

  const navToSearch = useNavToSearch();

  useEffect(() => {
    setInputSorts([]);
    setSortRules([]);
  }, []);
  useEffect(() => {
    setSortRules(parseSorts(inputSorts));
  }, [inputSorts]);

  const toQueryString = () => {
    const filters: string[] = [];
    const sets = searchSet.concat(extraSets);
    if (sets.length) {
      switch (searchToken) {
        case 'Cards': {
          if (sets.length == 1) {
            filters.push(`set:${sets[0]}`);
          } else {
            filters.push(`(${sets.map(set => `set:${set}`).join(' or ')})`);
          }
          break;
        }
        case 'Tokens': {
          if (sets.length == 1) {
            filters.push(`~set:${sets[0]}`);
          } else {
            filters.push(`(${sets.map(set => `~:${set}`).join(' or ')})`);
          }
          break;
        }
        case 'Both': {
          if (sets.length == 1) {
            filters.push(`group:${sets[0]}`);
          } else {
            filters.push(`(${sets.map(set => `group:${set}`).join(' or ')})`);
          }
          break;
        }
      }
    }
    const orFilters: string[] = [];
    const addHandlingOr = (searchKeyword: string, searchTerm: string, defaultOp = ':') => {
      if (searchTerm.startsWith('!?')) {
        orFilters.push(`-${searchKeyword}${defaultOp}"${searchTerm.slice(2)}"`);
      } else if (searchTerm.startsWith('!')) {
        filters.push(`-${searchKeyword}${defaultOp}"${searchTerm.slice(1)}"`);
      } else if (searchTerm.startsWith('?')) {
        orFilters.push(`${searchKeyword}${defaultOp}"${searchTerm.slice(1)}"`);
      } else {
        filters.push(`${searchKeyword}${defaultOp}"${searchTerm}"`);
      }
    };
    const addAllHandlingOr = (searchKeyword: string, searchTerm: string[], defaultOp = ':') => {
      searchTerm.forEach(term => addHandlingOr(searchKeyword, term, defaultOp));
    };
    if (idSearch) {
      addHandlingOr('id', idSearch);
    }
    if (nameSearch.length) {
      addAllHandlingOr('name', nameSearch);
    }
    if (costSearch.length) {
      addAllHandlingOr('mana', costSearch);
    }
    if (typeSearch.length) {
      addAllHandlingOr('type', typeSearch);
    }
    if (rulesSearch.length) {
      addAllHandlingOr('oracle', rulesSearch);
    }
    if (flavorSearch.length) {
      addAllHandlingOr('flavor', flavorSearch);
    }
    if (creators.length) {
      addAllHandlingOr('creator', creators);
    }
    if (artists.length) {
      addAllHandlingOr('artist', artists);
    }
    if (tags.length) {
      addAllHandlingOr('tag', tags, '=');
    }
    if (isCommander) {
      filters.push('is:commander');
    }
    if (standardLegality) {
      filters.push(`${standardLegality.replace('_', '')}:standard`);
    }
    if (fourcbLegality) {
      filters.push(`${fourcbLegality.replace('_', '')}:4cb`);
    }
    if (commanderLegality) {
      filters.push(`${commanderLegality.replace('_', '')}:commander`);
    }
    if (collectorNumber[0] != undefined) {
      filters.push(`number${collectorNumber[1]}${collectorNumber[0]}`);
    }
    if (manaValue[0] != undefined) {
      filters.push(`manavalue${manaValue[1]}${manaValue[0]}`);
    }
    if (power[0] != undefined) {
      filters.push(`power${power[1]}${power[0]}`);
    }
    if (toughness[0] != undefined) {
      filters.push(`toughness${toughness[1]}${toughness[0]}`);
    }
    if (loyalty[0] != undefined) {
      filters.push(`${loyalty[1]}${loyalty[0]}`);
    }
    if (defense[0] != undefined) {
      filters.push(`${defense[1]}${defense[0]}`);
    }
    if (colorNumber[0] != undefined) {
      filters.push(`color${colorNumber[1]}${colorNumber[0]}`);
    }
    if (colorIdentityNumber[0] != undefined) {
      filters.push(`identity${colorIdentityNumber[1]}${colorIdentityNumber[0]}`);
    }
    if (searchColors.length) {
      filters.push(`color${colorComparison}${searchColors.join('')}`);
    }
    if (searchColorIdentities.length) {
      filters.push(
        hybridIdentityRule
          ? `hybrid${colorIdentityComparison}${searchColorIdentities.join('')}`
          : `identity${colorIdentityComparison}${searchColorIdentities.join('')}`
      );
    }
    if (orFilters.length) {
      if (orFilters.length == 1) {
        filters.push(orFilters[0]);
      } else {
        filters.push(`(${orFilters.join(' or ')})`);
      }
    }
    if (includeExtraSets) {
      filters.push('include:extras');
    }
    inputSorts.forEach(input => {
      const [sort, dir] = input.split(',', 2);
      if (sort != 'auto' && dir != 'auto') {
        filters.push(`sort:${input}`);
      } else if (sort != dir) {
        filters.push(`sort:${dir == 'auto' ? sort : dir}`);
      }
    });
    return filters.join(' ');
  };
  useEffect(() => {
    const newQuery = toQueryString();
    if (localQuery != newQuery) {
      setLocalQuery(newQuery);
    }
  }, [
    searchSet,
    extraSets,
    searchToken,
    idSearch,
    nameSearch,
    costSearch,
    typeSearch,
    rulesSearch,
    flavorSearch,
    creators,
    artists,
    tags,
    isCommander,
    standardLegality,
    fourcbLegality,
    commanderLegality,
    collectorNumber,
    manaValue,
    power,
    toughness,
    loyalty,
    defense,
    colorNumber,
    colorIdentityNumber,
    searchColors,
    colorComparison,
    searchColorIdentities,
    colorIdentityComparison,
    hybridIdentityRule,
    includeExtraSets,
    inputSorts,
  ]);
  const excludeFiles = ['symbols/emoji/', 'colorIndicators/'];
  const pipList = pipsData.data
    .filter(pip => !excludeFiles.some(file => pip.filename.includes(file)))
    .map(pip => '{' + pip.symbol + '}');

  return (
    <div>
      <title>Advanced Search | Hellfall</title>
      <br />
      <Box cs={searchContainer}>
        <Box cs={searchCriteriaSection}>
          <PillSearch
            label={'Name'}
            possibleValues={[]}
            values={nameSearch}
            onChange={setNameSearch}
          />
          <FormField label="Id">
            <TextInput value={idSearch} onChange={event => setIdSearch(event.target.value)} />
          </FormField>
          <PillSearch
            label={'Cost'}
            possibleValues={pipList}
            values={costSearch}
            onChange={setCostSearch}
          />
          <PillSearch
            label={'Type'}
            possibleValues={typesData.data}
            values={typeSearch}
            onChange={setTypeSearch}
          />
          <PillSearch
            label={'Text'}
            possibleValues={[]}
            values={rulesSearch}
            onChange={setRulesSearch}
          />
        </Box>
        <Box cs={searchCriteriaSection}>
          <PillSearch
            label={'Flavor'}
            possibleValues={[]}
            values={flavorSearch}
            onChange={setFlavorSearch}
          />
          <PillSearch
            label={'Creator(s)'}
            possibleValues={creatorsData.data}
            values={creators}
            onChange={setCreators}
          />
          <PillSearch
            label={'Artist(s)'}
            possibleValues={[]}
            values={artists}
            onChange={setArtists}
          />
          <PillSearch
            label={'Tags'}
            possibleValues={tagsData.data}
            values={tags}
            onChange={setTags}
          />
        </Box>
        <Box cs={searchCriteriaSection}>
          <NamedCheckboxGroup
            label="Colors"
            values={HCSearchColors}
            names={['White', 'Blue', 'Black', 'Red', 'Green', 'Purple', 'Colorless', 'Misc']}
            value={searchColors}
            onChange={setSearchColors}
          >
            <Box cs={componentHolderStyles}>
              <label className={labelStyles} htmlFor="StyledDropdownSelect">
                {'Color Comparison'}
              </label>
              <select
                className={dropdownSelectStyles}
                id="StyledDropdownSelect"
                defaultValue={colorComparison}
                value={colorComparison}
                onChange={event => {
                  setColorComparison(event.target.value as any);
                }}
              >
                {looseOpList.map(entry => {
                  return <option key={entry}>{entry}</option>;
                })}
              </select>
            </Box>
          </NamedCheckboxGroup>
          <NumberSelector label={'Color Number'} onChange={setColorNumber} value={colorNumber} />
        </Box>
        <Box cs={searchCriteriaSection}>
          <NamedCheckboxGroup
            label="Color Identity (Commander)"
            values={HCSearchColors}
            names={['White', 'Blue', 'Black', 'Red', 'Green', 'Purple', 'Colorless', 'Misc']}
            value={searchColorIdentities}
            onChange={setSearchColorIdentities}
          >
            <Box cs={componentHolderStyles}>
              <label className={labelStyles} htmlFor="styledColorIdentitySelect">
                {'Color Identity Comparison'}
              </label>
              <select
                className={dropdownSelectStyles}
                id="styledColorIdentitySelect"
                defaultValue={colorIdentityComparison}
                value={colorIdentityComparison}
                onChange={event => {
                  setColorIdentityComparison(event.target.value as any);
                }}
              >
                {looseOpList.map(entry => {
                  return <option key={entry}>{entry}</option>;
                })}
              </select>
            </Box>
            <Box cs={componentHolderStyles}>
              <SingleCheckbox
                label={'Use Alternate Hybrid Rule'}
                onChange={setHybridIdentityRule}
                value={hybridIdentityRule}
              />
            </Box>
          </NamedCheckboxGroup>
          <NumberSelector
            label={'Color Identity Number'}
            onChange={setColorIdentityNumber}
            value={colorIdentityNumber}
          />
        </Box>
        <Box cs={searchCriteriaSection}>
          <CheckboxGroup
            value={searchSet}
            label={'Set'}
            values={[
              'HLC',
              'HC2',
              'HC3',
              'HC4',
              'HC6',
              'HCC',
              'HCP',
              'HC7',
              'HC7.0',
              'HC7.1',
              'HCK',
              'HC8',
              'HC8.0',
              'HC8.1',
              'HCJ',
              'HKL',
              'HC9',
              'SCL',
            ]}
            onChange={setSearchSet}
          />
        </Box>
        <Box cs={searchCriteriaSection}>
          <fieldset>
            <legend className={legendStyles}>{'Extras'}</legend>
            {extrasOpen ? (
              <>
                {/* <Box cs={componentHolderStyles}> */}
                <SingleCheckbox
                  label={'Include Extra Sets'}
                  onChange={setIncludeExtraSets}
                  value={includeExtraSets}
                />
                {/* </Box> */}
                <Box cs={componentHolderStyles}>
                  <BoxlessCheckboxGroup
                    value={extraSets}
                    label={'Extra Sets'}
                    values={extraSetList}
                    onChange={setExtraSets}
                  />
                </Box>
                <Box cs={componentHolderStyles}>
                  <label className={labelStyles} htmlFor="cards or tokens">
                    {'Cards/Tokens?'}
                  </label>
                  <select
                    className={dropdownSelectStyles}
                    id="cards or tokens"
                    defaultValue={searchToken}
                    value={searchToken}
                    onChange={event => {
                      setSearchToken(event.target.value as 'Cards' | 'Tokens' | 'Both');
                    }}
                  >
                    {['Cards', 'Tokens', 'Both'].map(entry => {
                      return <option key={entry}>{entry}</option>;
                    })}
                  </select>
                </Box>
                <br />
                <button
                  onClick={() => {
                    setExtrasOpen(false);
                  }}
                >
                  show less
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setExtrasOpen(true);
                }}
              >
                show more
              </button>
            )}
          </fieldset>
          <fieldset>
            <legend className={legendStyles}>{'Constructed Legality'}</legend>
            {legalityOpen ? (
              <>
                <Box cs={componentHolderStyles}>
                  <label className={labelStyles} htmlFor="standard">
                    {'Standard'}
                  </label>
                  <select
                    className={dropdownSelectStyles}
                    id="standard"
                    defaultValue={standardLegality}
                    value={standardLegality}
                    onChange={event => {
                      setStandardLegality(event.target.value as any);
                    }}
                  >
                    {['', 'legal', 'not_legal', 'banned'].map(entry => {
                      return <option key={entry}>{entry}</option>;
                    })}
                  </select>
                </Box>
                <Box cs={componentHolderStyles}>
                  <label className={labelStyles} htmlFor="4cb">
                    {'4 Card Blind'}
                  </label>
                  <select
                    className={dropdownSelectStyles}
                    id="4cb"
                    defaultValue={fourcbLegality}
                    value={fourcbLegality}
                    onChange={event => {
                      set4cbLegality(event.target.value as any);
                    }}
                  >
                    {['', 'legal', 'not_legal', 'banned'].map(entry => {
                      return <option key={entry}>{entry}</option>;
                    })}
                  </select>
                </Box>
                <Box cs={componentHolderStyles}>
                  <label className={labelStyles} htmlFor="commander">
                    {'Hellsmander'}
                  </label>
                  <select
                    className={dropdownSelectStyles}
                    id="commander"
                    defaultValue={commanderLegality}
                    value={commanderLegality}
                    onChange={event => {
                      setCommanderLegality(event.target.value as any);
                    }}
                  >
                    {['', 'legal', 'not_legal', 'banned'].map(entry => {
                      return <option key={entry}>{entry}</option>;
                    })}
                  </select>
                </Box>
                <SingleCheckbox
                  label={'Can Be Your Commander'}
                  onChange={setIsCommander}
                  value={isCommander}
                />
                <br />
                <button
                  onClick={() => {
                    setLegalityOpen(false);
                  }}
                >
                  show less
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setLegalityOpen(true);
                }}
              >
                show more
              </button>
            )}
          </fieldset>
          {/* </Box>
        <Box cs={searchCriteriaSection}> */}
          <NumberSelector
            label={'Collector number'}
            onChange={setCollectorNumber}
            value={collectorNumber}
          />
          <NumberSelector label={'Mana value'} onChange={setManaValue} value={manaValue} />
          <NumberSelector label={'Power'} onChange={setPower} value={power} />
          <NumberSelector label={'Toughness'} onChange={setToughness} value={toughness} />
          <NumberSelector label={'Loyalty'} onChange={setLoyalty} value={loyalty} />
          <NumberSelector label={'Defense'} onChange={setDefense} value={defense} />
          {/* TODO: Add other controls and add button to start search */}
        </Box>
      </Box>
      <hr className={separator} />
      <ControlBar />
      <hr className={sortSeparator} />
      <PrimaryButton
        colors={inputButtonColors}
        cs={startButton}
        as={Link}
        to={localQuery ? `/?q=${localQuery}` : '/'}
        onClick={(e: React.MouseEvent) => {
          if (!(e.button === 1 || e.metaKey || e.ctrlKey)) {
            setInputSorts([]);
            setSortRules([]);
          }
        }}
      >
        Search with these options
      </PrimaryButton>
    </div>
  );
};
const inputButtonColors: ButtonColors = {
  default: {
    background: inputColors.background,
    border: inputColors.border,
    label: inputColors.text,
  },
  hover: {
    background: inputColors.disabled.background,
    border: inputColors.focusBorder,
    label: inputColors.text,
  },
  active: {
    background: inputColors.background,
    border: inputColors.border,
    label: inputColors.text,
  },
  focus: {
    background: inputColors.disabled.background,
    border: inputColors.focusBorder,
    label: inputColors.text,
  },
  disabled: {
    background: inputColors.disabled.background,
    border: inputColors.disabled.border,
    label: inputColors.text,
  },
};

const searchCriteriaSection = createStyles({
  justifyContent: 'space-evenly',
  paddingLeft: '30px',
});
const searchContainer = createStyles({ display: 'flex', flexWrap: 'wrap' });
const dropdownSelectStyles = createStyles({ width: '100px', height: '30px' });
const sortSeparator = createStyles({
  height: '1px',
  backgroundColor: '#ccc',
  border: 'none',
  marginTop: '-20px',
});
const separator = createStyles({ height: '1px', backgroundColor: '#ccc', border: 'none' });
const startButton = createStyles({
  marginLeft: '30px',
  marginBottom: '15px',
  // display: 'inline-block',
  borderRadius: '4px',
  textDecoration: 'none',
  '&:hover, &:focus, &:active': {
    textDecoration: 'none',
  },
});
