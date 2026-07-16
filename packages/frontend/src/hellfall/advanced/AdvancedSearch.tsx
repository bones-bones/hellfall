import { StyledComponentHolder, StyledLabel, StyledLegend } from './AdvancedComponents.tsx';
import { PillSearch } from './PillSearch.tsx';
import {
  BoxlessCheckboxGroup,
  CheckboxGroup,
  NamedCheckboxGroup,
  NumberSelector,
  SingleCheckbox,
  InlineCheckbox,
} from './index.ts';
import { ButtonColors, TextInput, FormField } from '@workday/canvas-kit-react';
import { system } from '@workday/canvas-tokens-web';
import { useAtom } from 'jotai';
import { inputSortAtom, sortAtom } from '../atoms/searchAtoms.ts';
import { useEffect, useState } from 'react';
import { HCSearchColors } from '@hellfall/shared/types';
import { looseOpList, looseOpType } from '@hellfall/shared/filters';
import { ControlBar } from '../search-controls/ControlBar.tsx';
import { extraSetList, normalizeText } from '@hellfall/shared/utils';
import { creatorsData, pipsData, tagsData, typesData } from '@hellfall/shared/data';
import { createStyles } from '@workday/canvas-kit-styling';
import {
  createStyledDiv,
  createStyledHR,
  createStyledPrimaryButtonLink,
  createStyledSelect,
} from '../../styling';
import { useSyncSorts } from '../hooks/useUrlSync.ts';

export const AdvancedSearch = () => {
  const [idSearch, setIdSearch] = useState<string>('');
  const [nameSearch, setNameSearch] = useState<string[]>([]);
  const [costSearch, setCostSearch] = useState<string[]>([]);
  const [typeSearch, setTypeSearch] = useState<string[]>([]);
  const [rulesSearch, setRulesSearch] = useState<string[]>([]);
  const [flavorSearch, setFlavorSearch] = useState<string[]>([]);
  const [loreSearch, setLoreSearch] = useState<string[]>([]);
  const [printedSearch, setPrintedSearch] = useState<string[]>([]);
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

  const [includeExtras, setIncludeExtras] = useState(false);
  const [includeExtraCards, setIncludeExtraCards] = useState(false);
  const [includeTokens, setIncludeTokens] = useState(false);
  const [includeVetoed, setIncludeVetoed] = useState(false);
  const [includeDropped, setIncludeDropped] = useState(false);

  const [inputSorts, setInputSorts] = useAtom(inputSortAtom);
  const [sortRules, setSortRules] = useAtom(sortAtom);
  const [localQuery, setLocalQuery] = useState('');
  useSyncSorts();

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
    if (loreSearch.length) {
      addAllHandlingOr('lore', loreSearch);
    }
    if (printedSearch.length) {
      addAllHandlingOr('printed', printedSearch);
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
    if (includeExtras) {
      filters.push('include:extras');
    }
    if (includeExtraCards) {
      filters.push('include:extracards');
    }
    if (includeTokens) {
      filters.push('include:tokens');
    }
    if (includeVetoed) {
      filters.push('include:vetoed');
    }
    if (includeDropped) {
      filters.push('include:dropped');
    }
    inputSorts.forEach(input => {
      const [sort, dir] = input.split(',', 2);
      if (sort != 'auto' && dir != 'auto') {
        filters.push(`sort:${input}`);
      } else if (sort != dir) {
        filters.push(`sort:${dir == 'auto' ? sort : dir}`);
      }
    });
    return normalizeText(filters.join(' '));
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
    includeExtras,
    includeExtraCards,
    includeTokens,
    includeVetoed,
    includeDropped,
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
      <SearchContainer>
        <SearchCriteriaSection>
          <PillSearch label={'Name'} values={nameSearch} onChange={setNameSearch} />
          <FormField cs={idStyles}>
            <FormField.Label>Id</FormField.Label>
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
          <PillSearch label={'Text'} values={rulesSearch} onChange={setRulesSearch} />
        </SearchCriteriaSection>
        <SearchCriteriaSection>
          <PillSearch label={'Flavor'} values={flavorSearch} onChange={setFlavorSearch} />
          <PillSearch label={'Lore'} values={loreSearch} onChange={setLoreSearch} />
          <PillSearch label={'Printed'} values={printedSearch} onChange={setPrintedSearch} />
          <PillSearch
            label={'Creator(s)'}
            possibleValues={creatorsData.data}
            values={creators}
            onChange={setCreators}
          />
          <PillSearch label={'Artist(s)'} values={artists} onChange={setArtists} />
          <PillSearch
            label={'Tags'}
            possibleValues={tagsData.data}
            values={tags}
            onChange={setTags}
          />
        </SearchCriteriaSection>
        <SearchCriteriaSection>
          <NamedCheckboxGroup
            label="Colors"
            values={HCSearchColors}
            names={['White', 'Blue', 'Black', 'Red', 'Green', 'Purple', 'Colorless', 'Misc']}
            value={searchColors}
            onChange={setSearchColors}
          >
            <StyledComponentHolder>
              <StyledLabel htmlFor="StyledDropdownSelect">{'Color Comparison'}</StyledLabel>
              <StyledDropdownSelect
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
              </StyledDropdownSelect>
            </StyledComponentHolder>
          </NamedCheckboxGroup>
          <NumberSelector label={'Color Number'} onChange={setColorNumber} value={colorNumber} />
        </SearchCriteriaSection>
        <SearchCriteriaSection>
          <NamedCheckboxGroup
            label="Color Identity (Commander)"
            values={HCSearchColors}
            names={['White', 'Blue', 'Black', 'Red', 'Green', 'Purple', 'Colorless', 'Misc']}
            value={searchColorIdentities}
            onChange={setSearchColorIdentities}
          >
            <StyledComponentHolder>
              <StyledLabel htmlFor="styledColorIdentitySelect">
                {'Color Identity Comparison'}
              </StyledLabel>
              <StyledDropdownSelect
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
              </StyledDropdownSelect>
            </StyledComponentHolder>
            <StyledComponentHolder>
              <SingleCheckbox
                label={'Use Alternate Hybrid Rule'}
                onChange={setHybridIdentityRule}
                value={hybridIdentityRule}
              />
            </StyledComponentHolder>
          </NamedCheckboxGroup>
          <NumberSelector
            label={'Color Identity Number'}
            onChange={setColorIdentityNumber}
            value={colorIdentityNumber}
          />
        </SearchCriteriaSection>
        <SearchCriteriaSection>
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
            ]}
            onChange={setSearchSet}
          />
        </SearchCriteriaSection>
        <SearchCriteriaSection>
          <fieldset>
            <StyledLegend>{'Extras'}</StyledLegend>
            {extrasOpen ? (
              <>
                {/* </StyledComponentHolder> */}
                <StyledComponentHolder>
                  <BoxlessCheckboxGroup
                    value={extraSets}
                    label={'Extra Sets'}
                    values={extraSetList}
                    onChange={setExtraSets}
                  />
                </StyledComponentHolder>
                <StyledComponentHolder>
                  <StyledLabel htmlFor="cards or tokens">{'Cards/Tokens?'}</StyledLabel>
                  <StyledDropdownSelect
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
                  </StyledDropdownSelect>
                </StyledComponentHolder>
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
            <StyledLegend>{'Constructed Legality'}</StyledLegend>
            {legalityOpen ? (
              <>
                <StyledComponentHolder>
                  <StyledLabel htmlFor="standard">{'Standard'}</StyledLabel>
                  <StyledDropdownSelect
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
                  </StyledDropdownSelect>
                </StyledComponentHolder>
                <StyledComponentHolder>
                  <StyledLabel htmlFor="4cb">{'4 Card Blind'}</StyledLabel>
                  <StyledDropdownSelect
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
                  </StyledDropdownSelect>
                </StyledComponentHolder>
                <StyledComponentHolder>
                  <StyledLabel htmlFor="commander">{'Hellsmander'}</StyledLabel>
                  <StyledDropdownSelect
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
                  </StyledDropdownSelect>
                </StyledComponentHolder>
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
          {/* </SearchCriteriaSection>
        <SearchCriteriaSection> */}
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
        </SearchCriteriaSection>
      </SearchContainer>
      <Separator />
      <ControlBar>
        <InlineCheckbox
          label={'Include all extras'}
          onChange={setIncludeExtras}
          value={includeExtras}
        />
        <InlineCheckbox
          label={'Include extra cards'}
          onChange={setIncludeExtraCards}
          value={includeExtraCards}
        />
        <InlineCheckbox
          label={'Include tokens'}
          onChange={setIncludeTokens}
          value={includeTokens}
        />
        <InlineCheckbox
          label={'Include vetoed cards'}
          onChange={setIncludeVetoed}
          value={includeVetoed}
        />
        <InlineCheckbox
          label={'Include dropped faces'}
          onChange={setIncludeDropped}
          value={includeDropped}
        />
      </ControlBar>
      <SortSeparator />
      <StartButton
        colors={inputButtonColors}
        // cs={startButton}
        to={localQuery ? `/?q=${encodeURIComponent(localQuery)}` : '/'}
        onClick={(e: React.MouseEvent) => {
          if (!(e.button === 1 || e.metaKey || e.ctrlKey)) {
            setInputSorts([]);
            setSortRules([]);
          }
        }}
      >
        Search with these options
      </StartButton>
    </div>
  );
};

const idStyles = createStyles({
  marginBottom: '20px',
});
const inputButtonColors: ButtonColors = {
  default: {
    background: system.color.bg.default,
    border: system.color.border.input.default,
    label: system.color.fg.default,
  },
  hover: {
    background: system.color.surface.raised,
    border: system.color.brand.border.primary,
    label: system.color.fg.default,
  },
  active: {
    background: system.color.bg.default,
    border: system.color.border.input.default,
    label: system.color.fg.default,
  },
  focus: {
    background: system.color.surface.raised,
    border: system.color.brand.border.primary,
    label: system.color.fg.default,
  },
  disabled: {
    background: system.color.surface.raised,
    border: system.color.fg.disabled,
    label: system.color.fg.default,
  },
};

const searchCriteriaSectionStyles = createStyles({
  justifyContent: 'space-evenly',
  paddingLeft: '30px',
});
const SearchCriteriaSection = createStyledDiv(searchCriteriaSectionStyles, 'SearchCriteriaSection');

const searchContainerStyles = createStyles({ display: 'flex', flexWrap: 'wrap' });
const SearchContainer = createStyledDiv(searchContainerStyles, 'SearchContainer');

const dropdownSelectStyles = createStyles({ width: '100px', height: '30px' });
const StyledDropdownSelect = createStyledSelect(dropdownSelectStyles, 'StyledDropdownSelect');

const sortSeparatorStyles = createStyles({
  height: '1px',
  backgroundColor: '#ccc',
  border: 'none',
  marginTop: '-20px',
});
const SortSeparator = createStyledHR(sortSeparatorStyles, 'SortSeparator');

const separatorStyles = createStyles({ height: '1px', backgroundColor: '#ccc', border: 'none' });
const Separator = createStyledHR(separatorStyles, 'Separator');

const startButtonStyles = createStyles({
  marginLeft: '30px',
  marginBottom: '15px',
  // display: 'inline-block',
  borderRadius: '4px',
  textDecoration: 'none',
  '&:hover, &:focus, &:active': {
    textDecoration: 'none',
  },
});
const StartButton = createStyledPrimaryButtonLink(startButtonStyles, 'StartButton');
